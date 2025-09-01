import React, { useState, useEffect } from 'react';
import { useParams } from "react-router-dom";
import AnimalCard from './bits/AnimalCard';
import EthAddress from './bits/EthAddress';

import { useSelector } from 'react-redux';
import { readContract } from '@wagmi/core';
import { useContractRead } from 'wagmi';

const AnimalsByOwner = () => {
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const abi = useSelector((state) => state.contract.abi);
  const address = useSelector((state) => state.contract.address);

  const balance = useContractRead({
    abi,
    address,
    functionName: 'balanceOf',
    args: [id],
    watch: true,
  });

  const fetchAnimals = async () => {
    setLoading(true);
    const animals = [];

    for (let i = 0; i < Number(balance.data); i++) {
      try {
        const animalId = await readContract({
          abi,
          address,
          functionName: 'tokenOfOwnerByIndex',
          args: [id, i],
        });

        const animal = await readContract({
          abi,
          address,
          functionName: 'getAnimal',
          args: [animalId],
        });

        animals.push(animal);
        setAllAnimals([...animals]); // For smoother UI
      } catch (error) {
        console.warn(`Error fetching animal for owner ${id}:`, error);
      }
    }

    setLoading(false);
  };

  useEffect(() => {
    fetchAnimals();
  }, [id]);

  return (
    <main className="glass-card p-6 mt-32 max-w-6xl mx-auto">
      <h1 className="page-heading mb-4">
        <EthAddress>{id}</EthAddress>'s Pet{allAnimals.length !== 1 && "s"}
      </h1>

      <div className="flex justify-start mb-4">
        <button className="crypto-button" onClick={fetchAnimals}>
          Refresh
        </button>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <li className="text-white text-center text-xl">Loading...</li>}

        {!loading && allAnimals.length > 0 ? (
          allAnimals.map((animal, index) => (
            <AnimalCard key={index} animal={animal} />
          ))
        ) : (
          <li className="text-white text-center text-lg italic col-span-full">
            No pets found.
          </li>
        )}
      </ul>
    </main>
  );
};

export default AnimalsByOwner;
