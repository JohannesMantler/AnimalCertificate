import React, { useState, useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {prepareWriteContract, writeContract} from "wagmi/actions";

import { setCountdown, setColor, setLink, setText } from '../../redux/slices/tooltipSlice';

import {
    useAccount
} from 'wagmi'
import ReusableDropdown from './ReusableDropdown';

const ConfirmPregnancyButton = ({animal}) => {
    const dispatch = useDispatch();

    const [maleId, setMaleId] = useState(null);

    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const cancelButtonRef = useRef(null);
    
    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);
    
    
    const { address, isConnected } = useAccount()
    const allAnimals = useSelector((state) => state.animal.animals);
    
    const maleOwnerAnimals = allAnimals.filter( anim => anim.owner === address && anim.gender === 1 && anim.species === animal.species)
    
    
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
    
    const confirm_pregnancy = async (id) => {
        if(maleId === null){
            return false;
        }
        
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'confirmPregnancy',
            args: [id, maleId]
        })

        try {
            const transaction= await writeContract(config)
            
            dispatch(setColor('green'));
            dispatch(setCountdown(5000));
            dispatch(setText('Animal minted'));
            dispatch(setLink(""));
            
            return true;
        } catch (error) {
            console.log(error.message)
            return false;
        }
    }
    
    const handleConfirm = () => {
        // Set the state to close the modal
        setModalOpen(false);
        console.log(animal)
        confirm_pregnancy(animal.id)
            .then(r => {
                console.log(r)
                setIsErrorOpen(r !== true)
            })
        console.log("confirmed pregnancie")
    };
    
    const handleMaleChange = (value) => {
        setMaleId(value)
    };
    
    let owned_animals_selectorate = [{"label": "Seems you don't own any applicable animals", "value": null}]
    if(maleOwnerAnimals.length > 0) {
        owned_animals_selectorate = maleOwnerAnimals.map((anim) => ({
            label: anim.breed,
            value: anim.id
        }));
    }    
    
    
    return (
        <div>
            <button
                className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeathClick}
            >
                Confirm Pregnancy
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded">
                        <p className="text-gray-800 mb-4">
                            Select the other parent:
                            {maleOwnerAnimals.length > 0 && (
                                <span className="text-black">
                                    <ReusableDropdown
                                        options={owned_animals_selectorate}
                                        onChange={handleMaleChange}
                                        store_adress={null}
                                        default_label="your animals"
                                    /> 
                                </span>
                            )}
                        </p>
                        
                        <p className="text-gray-800 mb-4">
                            Are you sure, this animal is pregnant? This action cannot be reverted, but you will be able to abort your animals pregnancy if an error occured.
                        </p>
                        
                        
                        
                        <button
                            className="bg-pink-600 hover:bg-pink-500 text-white font-bold py-2 px-4 mt-4 rounded"
                            onClick={handleConfirm}
                        >
                            Confirm Pregnancy
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

export default ConfirmPregnancyButton;