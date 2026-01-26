import React, { useState, useEffect, useRef } from 'react';
import {useSelector, useDispatch} from 'react-redux';
import {getTimeInUnix} from "../../helper";

import {prepareWriteContract, writeContract} from "wagmi/actions";

const DeclareDeathButton = ({animal}) => {
    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const cancelButtonRef = useRef(null);
    
    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);
    
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
    
    const declare_death = async (id) => {
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'death',
            args: [id, getTimeInUnix(Date.now())]
        })

        try {
            const transaction= await writeContract(config)
            return true;
        } catch (error) {
            console.log(error.message)
            return false;
        }
    }
    
    const handleConfirm = () => {
        setModalOpen(false);
        declare_death(animal.id)
            .then(r => {
                console.log(r)
                setIsErrorOpen(r !== true)
            })
        console.log("I'M SORRY LITTLE ONE!")
    };
    
    return (
        <div>
            <button
                className="bg-black hover:bg-gray-800 text-white font-bold py-2 px-4 rounded"
                onClick={handleDeathClick}
            >
                Declare death
            </button>
            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                    <div className="bg-white p-6 rounded">
                        <p className="text-gray-800 mb-4">
                            Are you sure, that you want to declare this animal dead? This action cannot be reverted
                            later!
                        </p>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 mt-4 rounded"
                            onClick={handleConfirm}
                        >
                            Confirm Death
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

export default DeclareDeathButton;