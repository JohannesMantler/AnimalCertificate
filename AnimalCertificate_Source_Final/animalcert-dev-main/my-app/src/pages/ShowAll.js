import React, { useState, useEffect } from 'react';
import AnimalCard from './bits/AnimalCard';

import ReusableDropdown from './bits/ReusableDropdown';

import { useSelector, useDispatch } from 'react-redux';
import {
    addAnimal, extendAnimals, removeAnimal, clearAnimals, mergeAnimals,
    addOwner, extendOwners, removeOwner, clearOwners, mergeOwners,
    setSupply
} from '../redux/slices/animalSlice';
import {
    setSortBy,
    setSortDirection,
    setSearchString,
    setAddressSearchString,
    setUltimateSearchString,
} from '../redux/slices/sorterSlice';

import Fuse from "fuse.js";

import { siftBigInt } from '../constants';

import {
    readContract
} from '@wagmi/core'

import {
    useContractRead
} from 'wagmi'

import contract_abi from '../abis/AnimalCertificate.json';

const ShowAll = () => {
    const dispatch = useDispatch();
    
    const sortBy = useSelector((state) => state.sorter.sort_by);
    const sortDir = useSelector((state) => state.sorter.sort_dir);
    const searchString = useSelector((state) => state.sorter.search_string);
    const [sortedAnimals, setSortedAnimals] = useState([])
    
    const allAnimals = useSelector((state) => state.animal.animals);
    const lastAnimalUpdate = useSelector((state) => state.animal.lastUpdateAnimal);

    const [loading, setLoading] = useState(false);


    const contract_address = useSelector((state) => state.contract.address);


    //TODO: Contract supply routine
    //const supply = useSelector((state) => state.animal.supply);
    //const lastSupplyUpdate = useSelector((state) => state.animal.lastUpdateSupply);

    const contract_supply = useContractRead({
        abi: contract_abi,
        address: contract_address,
        functionName: 'totalSupply',
        watch: true,
    })

    //dispatch(setSupply(Number(contract_supply.data)))
    //End Of Contract supply routine


    const fetchAnimalsFromContract = async () => {
        let twoMinutesAgo = Date.now() - 2;
        
        console.log(lastAnimalUpdate)
        console.log(twoMinutesAgo)

        // Check if the last update was more than 2 minutes ago
        if (lastAnimalUpdate < twoMinutesAgo) {
            setLoading(true);

            let all_animals_at_start = [...allAnimals];
            console.log(all_animals_at_start)

            for (let i = 0; i < Number(contract_supply.data); i++) {
                // Check if the animal is already in the list
                const animalExists = all_animals_at_start.some(animal => animal.id === i);
                if (!animalExists) {
                    try {
                        let single_read_animal = await readContract({
                            abi: contract_abi,
                            address: contract_address,
                            functionName: 'getAnimal',
                            args: [i]
                        })
                        
                        let clensed_animal = siftBigInt(single_read_animal);
                        
                        let owner = await readContract({
                            abi: contract_abi,
                            address: contract_address,
                            functionName: 'ownerOf',
                            args: [i]
                        })
                        
                        clensed_animal["owner"] = siftBigInt(owner);
                        console.log(clensed_animal);

                        //adding in loop to make it look swifter:
                        all_animals_at_start.push(clensed_animal);

                    } catch (error) {
                        console.warn("Error while fetchhing animal " + i + ": ", error);
                    }
                }
            }
            
            dispatch(mergeAnimals(all_animals_at_start));

            setLoading(false)
        }
    }
    
    

    useEffect(() => {
        fetchAnimalsFromContract();
    }, []);
    
    useEffect(() => {
        const unsortedAnimals = [...allAnimals];
        
        const fuse = new Fuse(unsortedAnimals, 
            {
                keys: ["name", "id"],
                includeMatches:true,
                threshold: 0.2
            }
        )
        
        
        let filteredAnimals = unsortedAnimals
        if (searchString.length > 0) {
            filteredAnimals = fuse.search(searchString).map((result) => result.item);
        }
        
        let sortedAnimals = filteredAnimals;
        sortedAnimals = filteredAnimals.sort((a, b) => {
            return a[sortBy]>=b[sortBy]
        });
        
        if(!sortDir) sortedAnimals.reverse();
        
        
        setSortedAnimals(sortedAnimals);
        
        
    }, [allAnimals, sortBy, sortDir, searchString,]);
    
    useEffect(() => {
        // Set default values for sortBy, sortDirection, and searchString on mount
        setLocalSearchString(searchString);
    }, [sortBy, sortDir, searchString]);

    const [localSearchString, setLocalSearchString] = useState(searchString);


    const handleSortByChange = (value) => {
        dispatch(setSortBy(value));
    };
    
    const handleSortDirectionChange = (value) => {
        dispatch(setSortDirection(value));
    };
    
    const handleSearchChange = (e) => {
        const value = e.target.value;
        setLocalSearchString(value);
        dispatch(setSearchString(value));
    };
    
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
        { label: 'Descending', value: false},
    ];
    
    


    return (
        <main>
            <h1 className="page-heading">Registered Animals</h1>

            <div className='flex flex-row p-2 mt-4 gap-2'>
                <button className='
                    px-4 py-2
                    rounded-lg shadow-sm  
                    text-sm font-medium text-neutral-900
                    
                    bg-white hover:bg-neutral-200 transition-all
                '
                onClick={fetchAnimalsFromContract} >
                    &#8635;
                </button>
                <ReusableDropdown
                    options={sortByOptions}
                    onChange={handleSortByChange}
                    store_adress={(state) => state.sorter.sort_by}
                    default_label={"Sort By:"}
                /> 
                <ReusableDropdown
                    options={sortDirOptions}
                    onChange={handleSortDirectionChange}
                    store_adress={(state) => state.sorter.sort_dir}
                    default_label={"Sort Direction:"}
                /> 
                <input
                    className=' grow
                        px-4 py-2
                        rounded-lg shadow-sm  
                        text-sm font-medium text-neutral-900
                        
                        bg-white hover:bg-neutral-200 transition-all
                    '
                    type="text"
                    placeholder="Search"
                    value={localSearchString}
                    onInput={handleSearchChange}
                />
            </div>

            <ul className="grid grid-cols-1 auto-rows-max md:grid-cols-2 xl:grid-cols-3 gap-4">
                {sortedAnimals.length > 0 ? (
                    sortedAnimals.map((animal, index) => (
                        <AnimalCard key={index} animal={animal} />
                    ))

                ) : (

                    // non found
                    <li>
                        No pets found.
                    </li>
                )}

                {loading &&
                    <li>
                        loading...
                    </li>
                }

            </ul>
        </main>
    );
};

export default ShowAll;
