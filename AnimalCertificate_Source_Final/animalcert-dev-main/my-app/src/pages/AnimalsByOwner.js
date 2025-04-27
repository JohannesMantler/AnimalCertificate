import React, { useState, useEffect } from 'react';
import { Link, useParams } from "react-router-dom";
import AnimalCard from './bits/AnimalCard';
import EthAddress from './bits/EthAddress';

import { useSelector, useDispatch } from 'react-redux';
import {
  readContract
} from '@wagmi/core'
import {
  useContractRead
} from 'wagmi'



const AnimalsByOwner = () => {
  const [allAnimals, setAllAnimals] = useState([]);
  const [loading, setLoading] = useState(false);

  const contract_abi = useSelector((state) => state.contract.abi);
  const contract_address = useSelector((state) => state.contract.address);

  let { id } = useParams();

  const balance_of_user = useContractRead({
    abi: contract_abi,
    address: contract_address,
    functionName: 'balanceOf',
    args: [id],
    watch: true,
  })

  const fetch_animals_by_owner = async () => {
    setLoading(true);

    let all_animals_at_start = [];

    for (let i = 0; i < balance_of_user.data; i++) {
      try {
        const single_read_animalId = await readContract({
          abi: contract_abi,
          address: contract_address,
          functionName: 'tokenOfOwnerByIndex',
          args: [id, i]
        });

        const single_read_animal = await readContract({
          abi: contract_abi,
          address: contract_address,
          functionName: 'getAnimal',
          args: [single_read_animalId]
        });

        //adding in loop to make it look swifter:
        all_animals_at_start.push(single_read_animal)
        setAllAnimals(all_animals_at_start);
      } catch (error) {
        console.warn("Error while fetchhing some animal: ", error);
      }
    }

    setLoading(false)
  }


  useEffect(() => {    
    fetch_animals_by_owner();
  }, []);

  return (
    <main>
      <h1 class="page-heading"><EthAddress>{id}</EthAddress>'s Pet{allAnimals != null && (allAnimals.length > 1 && "s")}:</h1>

      <div className='flex flex-row p-2 mt-4'>
        <button class='crypto-button justify-self-start' onClick={fetch_animals_by_owner}>Update</button>
      </div>

      <ul className="grid grid-cols-1 auto-rows-max md:grid-cols-2 xl:grid-cols-3 gap-4">
        {allAnimals.length > 0 ? (
          allAnimals.map((animal, index) => (
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

export default AnimalsByOwner;



/* <main role="main" className="col-lg-12 d-flex text-center">

              <div className="content mr-auto ml-auto">
                <h1>Show Animals by Owner-Address</h1>
                <form onSubmit={(event) => {
                  event.preventDefault();
                  this.getAnimalsOfOwner(this.id.value);
                }}>
                  <input
                    type='text'
                    className='form-control mb-1'
                    placeholder='id'
                    ref={(input) => { this.id = input }}
                  />

                  <ul id="animalDetail"></ul>
                  {
                  this.state.animalsOfOwner.map((animal, key) => {

                  const dog = require('../dog.webp');
                  const cat = require('../cat.webp');
                  let icon = animal.species === 0 ? cat : dog;

                  return(
                     <div key={key} className="col-md-3 mb-3" style={{backgroundColor: animal.gender===0 ? "pink" : "lightblue"}}>
                       <div>ID {animal.id.toString()}</div>
                       <div>name {animal.name}</div>
                       <div>gender {animal.gender===0 ? "Female" : "Male"}</div>
                       <div>species {animal.species === 0 ? 'cat' : 'dog'}</div>                  
                       <div>Pregnant {animal.pregnant.toString()}</div>
                       <div>Mother {animal.mother.toNumber()}</div>
                       <div>Father {animal.father.toNumber()}</div>
                       <img src={icon } width = "50" />
                     </div>
                   )
                 })
                  }
                </form>
              </div>
            </main>
            */