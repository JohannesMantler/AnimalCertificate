import React, { useMemo } from "react";
import { Link } from "react-router-dom";
import { useAccount, useContractRead } from "wagmi";
import { getAddress } from "viem";
import { useSelector } from "react-redux";
import * as AnimalMaps from "../../constants";
import contract_abi from "../../abis/AnimalCertificate.json";

const normalizeAnimal = (a) => {
  if (!a) return null;

  if (typeof a === "object" && ("id" in a || "name" in a)) {
    return {
      id: a.id,
      mother: a.mother,
      father: a.father,
      matePartner: a.matePartner,
      pregnant: a.pregnant,
      species: a.species,
      name: a.name,
      gender: a.gender,
      diseases: a.diseases ?? [],
      vaccinations: a.vaccinations ?? [],
      dateOfBirth: a.dateOfBirth,
      dateOfDeath: a.dateOfDeath,
      furColor: a.furColor,
      imageHash: a.imageHash,
    };
  }

  return {
    id: a[0],
    mother: a[1],
    father: a[2],
    matePartner: a[3],
    pregnant: a[4],
    species: a[5],
    name: a[6],
    gender: a[7],
    diseases: a[8] ?? [],
    vaccinations: a[9] ?? [],
    dateOfBirth: a[10],
    dateOfDeath: a[11],
    furColor: a[12],
    imageHash: a[13],
  };
};

const AnimalCard = ({ animal: rawAnimal }) => {
  const animal = normalizeAnimal(rawAnimal);
  const { address } = useAccount();
  const contract_address = useSelector((state) => state.contract.address);

  const tokenId = useMemo(() => {
    try {
      if (animal?.id === undefined || animal?.id === null) return null;
      return BigInt(animal.id);
    } catch {
      return null;
    }
  }, [animal?.id]);

  const canRead = !!contract_address && tokenId !== null;

  const { data: owner } = useContractRead({
    abi: contract_abi,
    address: contract_address,
    functionName: "ownerOf",
    args: canRead ? [tokenId] : undefined,
    enabled: canRead,
    watch: true,
  });

  const isMine = useMemo(() => {
    try {
      if (!address || !owner) return false;
      return getAddress(owner) === getAddress(address);
    } catch {
      return false;
    }
  }, [address, owner]);

  if (!animal) return null;

    return (
    <li className="w-full">
      <Link
        to={`/animals/${animal.id}`}
        className="
          glass-card
          block
          w-full
          h-[280px]                 
          rounded-lg
          border border-white
          drop-shadow-md
          relative
          cursor-pointer
          hover:opacity-95
          hover:-translate-y-1
          transition-all
        "
      >
        {isMine && (
          <span className="absolute top-1 right-2 text-[0.65rem] px-2 py-1 rounded-full bg-emerald-600 text-white font-semibold tracking-wide z-10">
            Your pet
          </span>
        )}

        <div className="grid grid-cols-5 grid-rows-4 h-full">
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

          <div className="row-span-1 col-span-4 px-4 py-2 border-b border-white">
            <span className="text-lg font-bold underline">
              Name: [{animal.name}]
            </span>
          </div>

          <div className="row-span-3 col-span-4 p-4 grid grid-cols-2 gap-1 text-sm overflow-y-auto">
            <span><b>Species</b>: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99]}</span>
            <span><b>Gender</b>: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99]}</span>
            <span><b>Birthday</b>: {new Date(Number(animal.dateOfBirth) * 1000).toLocaleDateString("de-AT")}</span>
            <span><b>Fur Color</b>: {AnimalMaps.ANIMAL_COLORS[animal.furColor ?? 99]}</span>

            <span className="col-span-2">

              <b>Diseases</b>: {(animal.diseases?.length ?? 0) > 0
                ? animal.diseases.map((d) => AnimalMaps.ANIMAL_DISEASES[Number(d)]).join(", ")
                : "No known diseases"}
            </span>

            <span className="col-span-2">
                <b>Vaccinations</b>: {(animal.vaccinations?.length ?? 0) > 0
                ? animal.vaccinations.map((d) => AnimalMaps.ANIMAL_VACCINATIONS[Number(d)]).join(", ")
                : "No known vaccines"}
            </span>
          </div>
        </div>
      </Link>
    </li>
  );
};

export default AnimalCard;
