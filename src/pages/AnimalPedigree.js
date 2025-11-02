import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import Component from './bits/PedigreeCard';
import Connector from './bits/PedigreeSpline';
import { useSelector } from 'react-redux';
import { readContract } from '@wagmi/core';

const AnimalPedigree = () => {
  const abi = useSelector((state) => state.contract.abi);
  const address = useSelector((state) => state.contract.address);
  const { id } = useParams();
  const [data, setData] = useState(null);
  const splineRefs = useRef([]);

  const fetchSingle = async (id) => {
    const animal = await readContract({
      abi,
      address,
      functionName: 'getAnimal',
      args: [id],
    });

    const owner = await readContract({
      abi,
      address,
      functionName: 'ownerOf',
      args: [id],
    });

    return { ...animal, owner };
  };

  const toDataItem = (animal) => {
    return {
      id: animal.id,
      animal,
      initialPos: { x: 0, y: 0 },
      connectedTo: [animal.father, animal.mother].filter(p => p && p !== animal.id),
    };
  };

  const fetchAll = async (id) => {
    const queue = [id];
    const visited = new Set();
    const dataList = [];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (visited.has(currentId)) continue;
      visited.add(currentId);

      const animal = await fetchSingle(currentId);
      const item = toDataItem(animal);
      dataList.push(item);
      queue.push(...item.connectedTo);
    }

    return dataList;
  };

  const calculatePositions = (data) => {
    const offsetX = 225, offsetY = 200, globalTopOffset = 25;
    const centerX = window.innerWidth / 2;

    data.forEach((node, i) => {
      node.initialPos.x = centerX - (data.length * offsetX) / 2 + i * offsetX;
      node.initialPos.y = globalTopOffset + (i % 3) * offsetY;
    });

    return data;
  };

  useEffect(() => {
    const run = async () => {
      const animals = await fetchAll(id);
      setData(calculatePositions(animals));
    };
    run();
  }, [id]);

  return (
    <main className="mt-32 px-4">
      {data ? (
        data.length > 0 ? (
          <>
            <div className="relative w-screen h-[60vh]">
              {data.map(item => (
                <Component
                  key={item.id}
                  initialPos={item.initialPos}
                  index={item.id}
                  id={`pedigree-card-${item.id}`}
                  ref={splineRefs}
                  animal={item.animal}
                  className="absolute"
                />
              ))}
            </div>

            {data.map(item =>
              item.connectedTo.map(parentId => (
                <Connector
                  key={`${item.id}-${parentId}`}
                  splineRefs={splineRefs}
                  componentRef1id={item.id}
                  componentRef2id={parentId}
                />
              ))
            )}
          </>
        ) : (
          <div className="text-white text-center text-lg italic">No pedigree found.</div>
        )
      ) : (
        <div className="text-5xl text-center mt-36 text-white">Loading...</div>
      )}
    </main>
  );
};

export default AnimalPedigree;
