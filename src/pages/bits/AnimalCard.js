import React from 'react';
import { Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { getAddress, isAddress } from "viem";
import * as AnimalMaps from '../../constants';

const AnimalCard = ({ animal }) => {
  const { address } = useAccount();

  const isMine = (() => {
    try {
      if (!address || !animal?.owner) return false;
      if (!isAddress(animal.owner)) return false;
      return getAddress(animal.owner) === getAddress(address);
    } catch {
      return false;
    }
  })();

  return (
    <li className="glass-card grid grid-cols-5 grid-rows-4 w-full rounded-lg border border-white h-fit drop-shadow-md relative">
      {/* "Your pet" badge */}
      {isMine && (
        <span className="absolute top-1 right-2 text-[0.65rem] px-2 py-1 rounded-full bg-emerald-600 text-white font-semibold tracking-wide">
          Your pet
        </span>
      )}

      {/* Avatar */}
      <div className="row-span-4 col-span-1 flex items-center justify-center border-r border-white p-2">
        <img
          src={
            animal.imageHash
              ? `https://gateway.pinata.cloud/ipfs/${animal.imageHash}`
              : AnimalMaps.ANIMAL_SPECIES_IMAGES[animal.species ?? 99]
          }
          alt="Animal"
          className="w-20 h-20 object-cover mx-auto rounded-full border-2 border-white"
        />
      </div>

      {/* Title */}
      <div className="row-span-1 col-span-4 px-4 py-2 border-b border-white">
        <span className="text-lg font-bold">
          Name: [
          <Link to={`/animals/${animal.id}`} className="underline">
            {animal.name}
          </Link>
          ]
        </span>
      </div>

      {/* Info Grid */}
      <div className="row-span-3 col-span-4 p-4 grid grid-cols-2 gap-1 text-sm">
        <span><b>Species</b>: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99]}</span>
        <span><b>Gender</b>: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99]}</span>
        <span><b>Birthday</b>: {new Date(Number(animal.dateOfBirth) * 1000).toLocaleDateString('de-AT')}</span>
        <span><b>Fur Color</b>: {AnimalMaps.ANIMAL_COLORS[animal.furColor ?? 99]}</span>
        <span className="col-span-2">
          <b>Diseases</b>: {animal.diseases.length > 0
            ? animal.diseases.map((d) => AnimalMaps.ANIMAL_DISEASES[d]).join(", ")
            : "No known diseases"}
        </span>
      </div>
    </li>
  );
};

export default AnimalCard;
