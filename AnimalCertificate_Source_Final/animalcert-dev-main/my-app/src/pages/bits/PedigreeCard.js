import React, { useRef, useEffect } from 'react';
import { Link } from "react-router-dom";
import EthAddress from '../bits/EthAddress';
import * as AnimalMaps from '../../constants'
import {validNode} from '../../constants';


const PedigreeCard = React.forwardRef(({ animal, index, id, initialPos }, ref) => {
    const cardRef = useRef(null);

    const handleDragStart = (event) => {
        event.dataTransfer.effectAllowed = "copyMove";
        event.dataTransfer.setData('text/plain', animal);
        event.target.classList.add('dragging');
    };
    
    const reposition = (exactPos) => {
        if(!exactPos){
            exactPos = {
                x: 0,
                y: 0 // y where dragend
            };
        }
    
        const posX = Math.min( window.innerWidth, Math.max( 0, exactPos.x ) );
        const posY = Math.min( window.innerWidth, Math.max( 0, exactPos.y ) );

        cardRef.current.style.position = 'absolute';
        cardRef.current.style.top = `${posY}px`;
        cardRef.current.style.left = `${posX}px`;
    }

    const handleDragEnd = (event) => {
        event.preventDefault();
        event.target.classList.remove('dragging');
        
        let exactPos = {
            x: event.clientX, // x where dragend
            y: event.clientY // y where dragend
        };

        if (handleDragEnd.timeoutId) {
            clearTimeout(handleDragEnd.timeoutId);
        }

        handleDragEnd.timeoutId = setTimeout(() => {
            reposition(exactPos);
            handleDragEnd.timeoutId = null;
        }, 11);

        
        console.log("dragged")
    };
    
    const handleResize = (event) => {
        event.preventDefault();
        if(event.target.classList){
            event.target.classList.remove('dragging');
        }
        let exactPos = null
        
        if ( validNode(cardRef.current) ) {
            let rect = cardRef.current.getBoundingClientRect()
        
            exactPos = {
                x: rect.left, // x where dragend
                y: rect.top // y where dragend
            };
        }
        

        if (handleResize.timeoutId) {
            clearTimeout(handleResize.timeoutId);
        }

        handleResize.timeoutId = setTimeout(() => {
            reposition(exactPos);
            handleResize.timeoutId = null;
        }, 11);

        
        console.log("dragged")
    };
    
    useEffect(() => {
    console.log(initialPos)
        reposition(initialPos);
        window.addEventListener("resize", handleResize);
        
        return () => {
            window.removeEventListener("resize", handleResize);
        };
    }, []);
    

    return (
        <div
            ref={(el) => {
                if (validNode(el)){
                    ref.current[index] = el;
                    cardRef.current = el;
                }
            }}
            className="
                grid grid-cols-3 grid-rows-[auto auto auto]
                absolut 
                milky-glass border-2 border-solid border-white rounded-lg shadow-md 
                
                transition-all duration-11 hover:cursor-pointer active:cursor-grabbing w-72
            "
            draggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            id={id}
        >
        
            <div className='row-span-3 row-start-1 col-span-1 col-start-1 h-full grid justify-center content-center border-r border-white border-solid p-2'>
                <img src={AnimalMaps.ANIMAL_SPECIES_IMAGES[Number(animal.species ?? 99n)]} alt="Animal Image" class="aspect-square w-24 milky-glass self-center rounded-full border-2 border-white" />
            </div>
        
            <div name="title" className="row-span-1 row-start-1 col-span-2 col-start-2 font-bold px-4 py-1 border-solid border-b border-white">
                <Link to={"/animals/" + Number(animal.id)} className="underline">{animal.breed.toString()}</Link>
            </div>
            
            <div name="owner" className="row-span-1 row-start-2 col-span-2 col-start-2 text-sm px-4 py-1 border-solid border-b border-white">
                <span className='font-bold'>Owner</span>: [<Link to={"/owner/" + animal.owner} className="underline"> <EthAddress>{animal.owner}</EthAddress> </Link>]
            </div>
            
            <div name="content" className="row-span-1 row-start-3 col-span-2 col-start-2 text-sm p-4 grid gap-1">
                <span>
                    <span className='font-bold'>Species</span>: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99]}
                </span>
				<span>
                    <span className='font-bold'>Gender</span>: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99]}
                </span>
				<span>
                    <span className='font-bold'>Birthday</span>: {new Date(Number(animal.dateOfBirth * 1000n)).toLocaleDateString('de-AT')}
                </span>
            </div>
        
            
        </div>
    );
});

export default PedigreeCard;
