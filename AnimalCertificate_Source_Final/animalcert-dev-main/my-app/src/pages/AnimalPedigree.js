//import './Pedigree.css';

import React, { useRef, useEffect, useState } from 'react';
import Component from './bits/PedigreeCard';
import Connector from './bits/PedigreeSpline';

import { Link, useParams } from 'react-router-dom';

import { useSelector, useDispatch } from 'react-redux';

import {
  readContract
} from '@wagmi/core'

const AnimalPedigree = () => {

  const contract_abi = useSelector((state) => state.contract.abi);
  const contract_address = useSelector((state) => state.contract.address);



  const fetchSingle = async (id) => {
    let single = await readContract({
      abi: contract_abi,
      address: contract_address,
      functionName: 'getAnimal',
      args: [id]
    })
    let owner = await readContract({
      abi: contract_abi,
      address: contract_address,
      functionName: 'ownerOf',
      args: [id]
    })
    
    let animal = Object.assign({}, single);
    animal.owner = owner

    return animal
  }

  const toDataItem = (animal) => {
    const dataOutPut = { initialPos: { x: 0, y: 0 }, id: 0, animal: null, connectedTo: [] }

    if (animal) dataOutPut.animal = animal;
    if (animal.id) dataOutPut.id = animal.id;
    if (animal.father !== animal.id) dataOutPut.connectedTo.push(animal.father);
    if (animal.mother !== animal.id) dataOutPut.connectedTo.push(animal.mother);

    return dataOutPut
  }

  const fetchAnimals = async (id) => {
    var doneList = [id]
    var dataList = []

    let master = await fetchSingle(id);

    dataList.push(toDataItem(master))


    let lookdepth = 2;
    let gNodes = []

    if(master.father !== master.id && master.father !== 0n) gNodes.push(master.father);
    if(master.mother !== master.id && master.mother !== 0n) gNodes.push(master.mother);

    for (let index = 0; index < lookdepth; index++) {
      for (let jndex = 0; jndex < gNodes.length; jndex++) {
        const gid = gNodes.splice(jndex, 1)[0];
        
        if(!doneList.includes(gid)) {
          doneList.push(gid)

          let geriatric = await fetchSingle(gid);
  
          dataList.push(toDataItem(geriatric))
  
          if(geriatric.father !== geriatric.id && geriatric.father !== 0n) gNodes.push(geriatric.father);
          if(geriatric.mother !== geriatric.id && geriatric.mother !== 0n) gNodes.push(geriatric.mother);
        }
      }
    }
    
    return dataList
  }

  let { id } = useParams();


  const [data, setData] = useState(null);

  
  
  const updateData = async (id) => {
    let animals = await fetchAnimals(id);
    animals = calculateInitialPositions(animals);
    
    console.log(animals)
    
    setData(animals)
  }





  const splineRefs = React.useRef([]);

  const handleDragOver = (event) => {
    event.dataTransfer.dropEffect = "move";
    event.preventDefault();
  };



  function calculateInitialPositions(data) {
    console.log(data)


    const layers = [];
    const offsetX = 225;
    const offsetY = 200;
    const globalTopOffset = 25;

    // Step 1: Cluster array into layers by connected nodes
    const grandparents = data;
    layers.push(grandparents);

    

    // Step 2: Calculate x and y coordinates for each node

    // Calculate the total width required to distribute the layers on the x-axis
    let totalWidth = 0;
    layers.forEach(layer => {
      totalWidth += Math.ceil(layer.length * offsetX);
    });

    // Calculate the center coordinates of the screen
    const centerX = window.innerWidth / 2;
    const centerY = window.innerHeight / 2;

    // Iterate over each layer and distribute the nodes on the x and y axes
    layers.forEach((layer, layerIndex) => {
      let yPos = globalTopOffset + (centerY - (offsetY * (layers.length+1)) / 2) + ((layerIndex) * offsetY); // Calculate y position for the layer

      // Distribute nodes within the layer
      layer.forEach((node, nodeIndex) => {
        let xPos = (centerX - (offsetX * (layer.length+1)) /2) + ((nodeIndex) * offsetX); // Calculate initial x position for the layer

        node.initialPos.x = xPos;
        node.initialPos.y = yPos;
      });
    });

    return data;
  }




  useEffect(() => {
    document.addEventListener("dragover", handleDragOver);
    
    updateData(id)

    console.log(data)

    //calculateInitialPositions();
  }, [id]);


  return (
    <div>
      {data != null ? (
        data.length > 0 ?
          <React.Fragment>
            <div className="w-screen">
              {data.map((item) => {
                return (
                  <Component
                    initialPos={item.initialPos}
                    key={item.id}
                    index={item.id}
                    id={"pedigree-card-" + item.id}
                    ref={splineRefs}
                    animal={item.animal}
                    className="absolute"
                  />
                );
              }
              )}
            </div>
            {data.map((item) => (
              item.connectedTo.map((connectedId) => {
                if (connectedId != -1) {
                  return (
                    <Connector
                      key={`${item.id}-${connectedId}`}
                      splineRefs={splineRefs}
                      componentRef1id={item.id}
                      componentRef2id={connectedId}
                    />
                  );
                }
              })
            ))}
          </React.Fragment>
          : // non found
          <div>
            No pets found.
          </div>
      )
        : // loading animation
        <div className="text-6xl text-center mt-36">
          Loading...
        </div>
      }
    </div>
  );
};

export default AnimalPedigree;