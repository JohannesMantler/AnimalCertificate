import React, { useState, useEffect } from 'react';
import ReusableDropdown from './bits/ReusableDropdown';
import { clearAnimals, mergeAnimals } from '../redux/slices/animalSlice';
import { useSelector, useDispatch } from 'react-redux';
import {
  setSortBy,
  setSortDirection,
  setSearchString,
} from '../redux/slices/sorterSlice';

import Fuse from 'fuse.js';
import { siftBigInt } from '../constants';
import { readContract } from '@wagmi/core';
import { useContractRead } from 'wagmi';
import contract_abi from '../abis/AnimalCertificate.json';

const ShowAll = () => {
  const dispatch = useDispatch();
  const contract_address = useSelector((state) => state.contract.address);
  console.log("📡 Contract Address:", contract_address);

  const sortBy = useSelector((state) => state.sorter.sort_by);
  const sortDir = useSelector((state) => state.sorter.sort_dir);
  const searchString = useSelector((state) => state.sorter.search_string);
  const allAnimals = useSelector((state) => state.animal.animals);
  const lastAnimalUpdate = useSelector((state) => state.animal.lastUpdateAnimal);

  const [loading, setLoading] = useState(false);
  const [sortedAnimals, setSortedAnimals] = useState([]);
  const [localSearchString, setLocalSearchString] = useState(searchString);

  const contract_supply = useContractRead({
    abi: contract_abi,
    address: contract_address,
    functionName: 'totalSupply',
    watch: true,
  });

  console.log('🔢 Contract supply isSuccess:', contract_supply.isSuccess);
  console.log('📦 Contract supply data:', contract_supply.data);

  useEffect(() => {
    async function manualFetchSupply() {
      if (!contract_supply.isSuccess && contract_address) {
        try {
          const supply = await readContract({
            abi: contract_abi,
            address: contract_address,
            functionName: 'totalSupply',
          });
          console.log("🧮 Manual totalSupply call:", supply.toString());
        } catch (error) {
          console.error("❌ Error fetching totalSupply manually:", error);
        }
      }
    }
    manualFetchSupply();
  }, [contract_supply.isSuccess, contract_address]);

  const fetchAnimalsFromContract = async () => {
    if (!contract_supply.isSuccess || !contract_supply.data) {
      console.warn('⏳ Waiting for contract supply...');
      return;
    }

    const supply = Number(contract_supply.data.toString());
    console.log("🐢 totalSupply reported:", supply);
    const twoMinutesAgo = Date.now() - 2 * 60 * 1000;
    if (lastAnimalUpdate >= twoMinutesAgo) return;

    setLoading(true);
    const updatedAnimals = [...allAnimals];

    for (let i = 0; i < supply; i++) {
      console.log("🔍 Checking animal ID", i);
      const exists = updatedAnimals.some(animal => animal.id === i);
      if (!exists) {
        try {
          const rawAnimal = await readContract({
            abi: contract_abi,
            address: contract_address,
            functionName: 'getAnimal',
            args: [i],
          });
          console.log("🐾 rawAnimal:", i, rawAnimal);

          const owner = await readContract({
            abi: contract_abi,
            address: contract_address,
            functionName: 'ownerOf',
            args: [i],
          });
          console.log("👤 ownerOf:", i, owner);

          const cleaned = {
            ...siftBigInt(rawAnimal),
            owner: siftBigInt(owner),
          };

          console.log("✅ Cleaned animal:", cleaned);
          updatedAnimals.push(cleaned);
        } catch (err) {
          console.warn(`⚠️ Skipping token ID ${i}: getAnimal or ownerOf failed`, err);
        }
      } else {
        console.log(`⏩ Skipping ID ${i}, already exists in local state`);
      }
    }

    console.log("📦 Dispatching animals to Redux:", updatedAnimals);
    dispatch(mergeAnimals(updatedAnimals));
    setLoading(false);
  };

  useEffect(() => {
    if (contract_supply.isSuccess && contract_supply.data) {
      fetchAnimalsFromContract();
    }
  }, [contract_supply.data]);


  useEffect(() => {
    try {
      const unsortedAnimals = JSON.parse(JSON.stringify(allAnimals));

      console.log("🔠 Sorting animals:", {
        sortBy,
        sortDir,
        searchString,
        total: unsortedAnimals.length,
      });

      const fuse = new Fuse(unsortedAnimals, {
        keys: ['name', 'id'],
        includeMatches: true,
        threshold: 0.2,
      });

      let filtered = unsortedAnimals;
      if (searchString) {
        filtered = fuse.search(searchString).map(result => result.item);
      }

      const sorted = filtered.sort((a, b) => {
        const valA = a[sortBy]?.toString?.() ?? '';
        const valB = b[sortBy]?.toString?.() ?? '';
        return valA.localeCompare(valB);
      });

      if (!sortDir) sorted.reverse();
      setSortedAnimals(sorted);
    } catch (error) {
      console.error("❌ Sort/Filter error:", error);
      setSortedAnimals([]);
    }
  }, [allAnimals, sortBy, sortDir, searchString]);

  const sortByOptions = [
    { label: 'Name', value: 'name' },
    { label: 'ID', value: 'id' },
    { label: 'Birthday', value: 'dateOfBirth' },
    { label: 'Deathday', value: 'dateOfDeath' },
    { label: 'Gender', value: 'gender' },
    { label: 'Pregnant', value: 'pregnant' },
    { label: 'Species', value: 'species' },
  ];

  const sortDirOptions = [
    { label: 'Ascending', value: true },
    { label: 'Descending', value: false },
  ];

  return (
    <main className="glass-card p-6 mt-32 max-w-6xl mx-auto">
      <h1 className="page-heading mb-6">Registered Animals</h1>

      <div className="flex flex-wrap gap-2 mb-6">
        <button
          className="crypto-button text-sm"
          onClick={fetchAnimalsFromContract}
          title="Refresh Animals"
        >
          &#8635;
        </button>

        <ReusableDropdown
          options={sortByOptions}
          onChange={(value) => dispatch(setSortBy(value))}
          store_adress={(state) => state.sorter.sort_by}
          default_label="Sort By"
        />

        <ReusableDropdown
          options={sortDirOptions}
          onChange={(value) => dispatch(setSortDirection(value))}
          store_adress={(state) => state.sorter.sort_dir}
          default_label="Sort Direction"
        />

        <input
          className="px-4 py-2 rounded-lg bg-white text-sm text-gray-800 shadow-sm grow"
          type="text"
          placeholder="Search..."
          value={localSearchString}
          onChange={(e) => {
            const val = e.target.value;
            setLocalSearchString(val);
            dispatch(setSearchString(val));
          }}
        />
      </div>

      <ul className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {loading && (
          <li className="text-white text-center text-xl col-span-full">Loading...</li>
        )}

        {!loading && sortedAnimals.length > 0 ? (
          sortedAnimals.map((animal, index) => (
            <AnimalCard key={index} animal={animal} />
          ))
        ) : (
          <li className="text-white text-center text-lg italic col-span-full">
            No animals found.
          </li>
        )}
      </ul>
    </main>
  );
};

export default ShowAll;
