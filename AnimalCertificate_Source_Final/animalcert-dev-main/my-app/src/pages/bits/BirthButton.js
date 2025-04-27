import React, { useState, useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {prepareWriteContract, writeContract} from "wagmi/actions";

import { setCountdown, setColor, setLink, setText } from '../../redux/slices/tooltipSlice';

import {
    useAccount
} from 'wagmi'

import * as AnimalMaps from "../../constants";
import ReusableDropdown from './ReusableDropdown';

const BirthButton = ({animal}) => {
    const dispatch = useDispatch();


    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const cancelButtonRef = useRef(null);
    
    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);
    
    
    const { address, isConnected } = useAccount()
    const allAnimals = useSelector((state) => state.animal.animals);
    
    
    const [girNames, setGirNames] = useState("");
    const [boyNames, setBoyNames] = useState("");
    const [furColor, setFurColor] = useState(null);
    
    useEffect(() => {
        if (isModalOpen) {
            cancelButtonRef.current.focus();
        }
    }, [isModalOpen]);
    
    const handleDeathClick = () => setModalOpen(true);
    
    const handleCancel = () => {
        setModalOpen(false);
        console.log("DEATH PREVENTED!");
    };
    
    const confirm_birth = async (id) => {
        if(furColor === null || girNames === null || boyNames === null){
            return false;
        }
        
        let girNameList = girNames.split(',').map(name => name.trim());
        let boyNameList = boyNames.split(',').map(name => name.trim());
        
        if(girNameList.length <= 0 && boyNameList.length <= 0){
            return false;
        }
        
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'birth',
            args: [id, girNameList, boyNameList, furColor]
        })

        try {
            const transaction= await writeContract(config)
            
            dispatch(setColor('green'));
            dispatch(setCountdown(5000));
            dispatch(setText(animal.breed+' gave birth'));
            dispatch(setLink("/owner/"+animal.owner+"/"));
            
            return true;
        } catch (error) {
            console.log(error.message)
            return false;
        }
    }
    
    const handleConfirm = () => {
        // Set the state to close the modal
        setModalOpen(false);
        confirm_birth(animal.id)
            .then(r => {
                console.log(r)
                setIsErrorOpen(r !== true)
            })
        console.log("confirmed pregnancie")
    };
    
    const handleFurChange = (value) => {
        setFurColor(value)
    };
    
    console.log(Object.entries(AnimalMaps.ANIMAL_COLORS));
    
    const fur_color_selectorate = Object.entries(AnimalMaps.ANIMAL_COLORS).filter(([key, value]) =>{
        return key !== '99';
    }).map(([key, value]) => {
        return {
            "label": value,
            "value": key
        }
    });
    
    console.log(fur_color_selectorate)
    
    
    return (
        <div>
            <button
                className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeathClick}
            >
                Report Birth
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded">
                        
                        
                        <p className="text-gray-800 mb-4">
                            Congratulations! Your pet gave birth.
                            You are now able to name your pet's litter: 
                        </p>
                        
                        <div className="grid grid-cols-2 gap-2">
                            <input
                                type='text'
                                className='milky-glass my-5 form-control text-gray-800 text-sm rounded-lg focus:border-blue-500 block w-full p-2.5 border-2 border-gray-800 placeholder-neutral-700 placeholder-opacity-70'
                                placeholder='e.g. Roxy, Lea, Phoebe'
                                onChange={(e) => setGirNames(e.target.value)}
                                value={girNames}
                                
                            />
                            <input
                                type='text'
                                className='milky-glass my-5 form-control text-gray-800 text-sm rounded-lg focus:border-blue-500 block w-full p-2.5 border-2 border-gray-800 placeholder-neutral-700 placeholder-opacity-70'
                                placeholder='e.g. Felix, Monkey, Michael'
                                onChange={(e) => setBoyNames(e.target.value)}
                                value={boyNames}
                                
                            />
                        </div>
                        
                        <p className="text-gray-800 mb-4">
                            Select the color of the litter:
                            <span className="text-black">
                                <ReusableDropdown
                                    options={fur_color_selectorate}
                                    onChange={handleFurChange}
                                    store_adress={null}
                                    default_label="select color"
                                /> 
                            </span>
                        </p>
                        
                        
                        
                        <button
                            className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 mt-4 rounded"
                            onClick={handleConfirm}
                        >
                            Accept
                        </button>
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                            autoFocus
                            ref={cancelButtonRef}
                            onClick={handleCancel}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            )}
            {isErrorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-red-400 p-6 rounded">
                        <p className="text-white mb-4">
                            An error occurred!
                        </p>
                        <button
                            className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded mx-auto"
                            autoFocus
                            onClick={() => setIsErrorOpen(false)}>
                            OK
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BirthButton;