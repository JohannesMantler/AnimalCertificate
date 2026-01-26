import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from "react-router-dom";
import { useSelector } from 'react-redux';
import { readContract } from '@wagmi/core';
import { useContractRead } from 'wagmi';
import { getAddress, isAddress } from 'viem';
import AnimalCard from './bits/AnimalCard';
import EthAddress from './bits/EthAddress';
import { siftBigInt } from '../constants';


const AnimalsByOwner = () => {
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const { id } = useParams();
  const abi = useSelector((s) => s.contract.abi);
  const contractAddress = useSelector((s) => s.contract.address);

  // owner validieren
  const ownerAddr = (() => {
    try { return isAddress(id ?? '') ? getAddress(id) : null; } catch { return null; }
  })();

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

    setLoading(true);
    setAllAnimals([]);

    const supply = Number((totalSupply?.data ?? 0n));
    for (let tokenId = 0; tokenId < supply; tokenId++) {
      try {
        const tokenOwner = await readContract({
          abi,
          address: contractAddress,
          functionName: 'ownerOf',
          args: [BigInt(tokenId)],
        });

        // Normalize and validate owner
        let normalizedOwner = null;
        if (typeof tokenOwner === 'string' && isAddress(tokenOwner)) {
          normalizedOwner = getAddress(tokenOwner);
        }

        // Skip if invalid owner OR not the requested owner
        if (!normalizedOwner || normalizedOwner !== ownerAddr) continue;

        const animal = await readContract({
          abi,
          address: contractAddress,
          functionName: 'getAnimal',
          args: [BigInt(tokenId)],
        });

        const cleaned = {
          ...siftBigInt(animal),
          owner: normalizedOwner,
        };

        setAllAnimals(prev => [...prev, cleaned]);
      } catch {
        continue;
      }
    }

    setLoading(false);
  }, [abi, contractAddress, ownerAddr, totalSupply?.data]);

  useEffect(() => { fetchAnimals(); }, [fetchAnimals]);

  return (
    <main className="glass-card p-6 mt-32 max-w-6xl mx-auto">
      <h1 className="page-heading mb-4">
        <EthAddress>{ownerAddr ?? 'Invalid address'}</EthAddress>'s Pet{allAnimals.length !== 1 && "s"}
      </h1>

      <div className="flex justify-start mb-4">
        <button className="crypto-button" onClick={fetchAnimals} disabled={loading || !ownerAddr || !abi || !contractAddress}>
          {loading ? 'Loading…' : 'Refresh'}
        </button>
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && <li className="text-white text-center text-xl col-span-full">Loading...</li>}
        {!loading && allAnimals.length > 0 ? (
          allAnimals.map((animal, idx) => <AnimalCard key={idx} animal={animal} />)
        ) : (
          !loading && <li className="text-white text-center text-lg italic col-span-full">No pets found.</li>
        )}
      </ul>
    </main>
  );
};

export default AnimalsByOwner;
