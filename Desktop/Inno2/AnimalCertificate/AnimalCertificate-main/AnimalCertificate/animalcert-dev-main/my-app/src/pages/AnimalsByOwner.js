import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import { readContract } from '@wagmi/core';
import { useContractRead } from 'wagmi';
import { getAddress, isAddress } from 'viem';

import AnimalCard from './bits/AnimalCard';
import EthAddress from './bits/EthAddress';

const AnimalsByOwner = () => {
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const abi = useSelector((state) => state.contract.abi);
  const contractAddress = useSelector((state) => state.contract.address);

  // normalize+validate owner from route
  const ownerAddr = (() => {
    try {
      return isAddress(id ?? '') ? getAddress(id) : null;
    } catch {
      return null;
    }
  })();

  // totalSupply watcher (cheap, view)
  const totalSupply = useContractRead({
    abi,
    address: contractAddress,
    functionName: 'totalSupply',
    watch: true,
    enabled: Boolean(abi && contractAddress),
  });

  const fetchAnimals = useCallback(async () => {
    if (!abi || !contractAddress || !ownerAddr) {
      setAllAnimals([]);
      return;
    }
    const supplyBig = totalSupply?.data ?? 0n;
    const supply = Number(supplyBig);

    setLoading(true);
    setAllAnimals([]);

    const pushSmooth = (a) => setAllAnimals((prev) => [...prev, a]);

    for (let tokenId = 0; tokenId < supply; tokenId++) {
      try {
        const tokenOwner = await readContract({
          abi,
          address: contractAddress,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });

        if (getAddress(tokenOwner) !== ownerAddr) continue;

        const animal = await readContract({
          abi,
          address: contractAddress,
          functionName: 'getAnimal',
          args: [BigInt(tokenId)],
        });

        pushSmooth(animal);
      } catch (err) {
        // Non-existent/burned token or gap: just skip
        continue;
      }
    }

    setLoading(false);
  }, [abi, contractAddress, ownerAddr, totalSupply?.data]);

  useEffect(() => {
    fetchAnimals();
  }, [fetchAnimals]);

  return (
    <main className="glass-card p-6 mt-32 max-w-6xl mx-auto">
      <h1 className="page-heading mb-4">
        <EthAddress>{ownerAddr ?? 'Invalid address'}</EthAddress>'s Pet{allAnimals.length !== 1 && "s"}
      </h1>

      <div className="flex justify-start mb-4 gap-2">
        <button
          className="crypto-button"
          onClick={fetchAnimals}
          disabled={loading || !ownerAddr || !abi || !contractAddress}
        >
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <li className="text-white text-center text-xl col-span-full">Loading...</li>}

        {!loading && allAnimals.length > 0 ? (
          allAnimals.map((animal, index) => (
            <AnimalCard key={index} animal={animal} />
          ))
        ) : (
          !loading && (
            <li className="text-white text-center text-lg italic col-span-full">
              No pets found.
            </li>
          )
        )}
      </ul>
    </main>
  );
};

export default AnimalsByOwner;
