import React from 'react';
import { Link } from "react-router-dom";
import * as AnimalMaps from '../../constants'

const AnimalCard = ({ animal }) => {
    const dog = `${process.env.PUBLIC_URL}/dog.webp`;
    const cat = `${process.env.PUBLIC_URL}/cat.webp`;
    let icon = animal.species == 0 ? dog : cat;

    return (
        <li class="grid grid-cols-5 grid-rows-4 w-full milky-glass rounded-lg border-white border-solid border-2  h-fit drop-shadow-md">
            <div className='row-span-4 row-start-1 col-span-1 col-start-1 h-full grid justify-center content-center border-r border-white border-solid p-2'>
                <img src={AnimalMaps.ANIMAL_SPECIES_IMAGES[animal.species ?? 99]} alt="Animal Image" class="aspect-square milky-glass self-center rounded-full border-2 border-white" />
            </div>
            <div class="row-span-1 row-start-1 col-span-4 col-start-2 text-sm px-4 py-1 border-solid border-b border-white">
                <span class="text-lg font-bold ">Animal Name: [
                    <Link to={"/animals/" + animal.id.toString()} class="underline">{animal.breed}</Link>
                    ] </span>
            </div>
            <div class="row-span-3 row-start-2 col-span-4 col-start-2 text-sm p-4 grid gap-1 grid-cols-2">
                <span>
                    <span className='font-bold'>Species</span>: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99]}
                </span>
                <span>
                    <span className='font-bold'>Gender</span>: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99]}
                </span>
                <span>
                    <span className='font-bold'>Birthday</span>: {new Date(Number(animal.dateOfBirth) * 1000).toLocaleDateString('de-AT')}
                </span>
                <span>
                    <span className='font-bold'>Fur Color</span>: {AnimalMaps.ANIMAL_COLORS[animal.furColor ?? 99]}
                </span>
                <span className='col-span-2 self-stretch h-fit'>
                    <span className='font-bold'>Diseases</span>: {animal.diseases.length > 0
                        ? animal.diseases.map((disease) => AnimalMaps.ANIMAL_DISEASES[disease]).join(", ")
                        : "no known diseases"}
                </span>
            </div>
        </li>
    );
};

export default AnimalCard;