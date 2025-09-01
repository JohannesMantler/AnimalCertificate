import React, { useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import EthAddress from '../bits/EthAddress';
import * as AnimalMaps from '../../constants';
import { validNode } from '../../constants';

const PedigreeCard = React.forwardRef(({ animal, index, id, initialPos }, ref) => {
    const cardRef = useRef(null);

    const reposition = (pos) => {
        const x = Math.min(window.innerWidth, Math.max(0, pos?.x || 0));
        const y = Math.min(window.innerHeight, Math.max(0, pos?.y || 0));

        cardRef.current.style.position = 'absolute';
        cardRef.current.style.top = `${y}px`;
        cardRef.current.style.left = `${x}px`;
    };

    const handleDragEnd = (e) => {
        e.preventDefault();
        e.target.classList.remove('dragging');

        reposition({ x: e.clientX, y: e.clientY });
    };

    useEffect(() => {
        reposition(initialPos);
        window.addEventListener("resize", () => reposition(initialPos));
        return () => window.removeEventListener("resize", () => reposition(initialPos));
    }, []);

    return (
        <div
            ref={(el) => {
                if (validNode(el)) {
                    ref.current[index] = el;
                    cardRef.current = el;
                }
            }}
            id={id}
            className="glass-card w-72 grid grid-cols-3 grid-rows-[auto auto auto] border-white border-2 rounded-lg shadow-md absolute cursor-grab"
            draggable={true}
            onDragEnd={handleDragEnd}
        >
            {/* Image */}
            <div className="col-span-1 row-span-3 flex items-center justify-center border-r border-white p-2">
                <img
                    src={AnimalMaps.ANIMAL_SPECIES_IMAGES[Number(animal.species ?? 99n)]}
                    alt="Animal"
                    className="w-20 h-20 object-contain mx-auto rounded-full border-2 border-white"
                 />
            </div>

            {/* Name */}
            <div className="col-span-2 border-b border-white font-bold px-4 py-1">
                <Link to={`/animals/${Number(animal.id)}`} className="underline">{animal.breed}</Link>
            </div>

            {/* Owner */}
            <div className="col-span-2 border-b border-white text-sm px-4 py-1">
                <span className="font-bold">Owner</span>: [<Link to={`/owner/${animal.owner}`} className="underline"><EthAddress>{animal.owner}</EthAddress></Link>]
            </div>

            {/* Info */}
            <div className="col-span-2 text-sm p-4 grid gap-1">
                <span><b>Species</b>: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99]}</span>
                <span><b>Gender</b>: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99]}</span>
                <span><b>Birthday</b>: {new Date(Number(animal.dateOfBirth * 1000n)).toLocaleDateString('de-AT')}</span>
            </div>
        </div>
    );
});

export default PedigreeCard;
