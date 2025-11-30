import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { setCountdown, setColor, setLink, setText } from '../../redux/slices/tooltipSlice';
import { useAccount } from 'wagmi';
import ReusableDropdown from './ReusableDropdown';

const ConfirmPregnancyButton = ({ animal }) => {
    const dispatch = useDispatch();
    const [maleId, setMaleId] = useState(null);
    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const cancelButtonRef = useRef(null);

    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);

    const { address, isConnected } = useAccount();
    const allAnimals = useSelector((state) => state.animal.animals);

    // --- FIX: Robusterer Filter für Männliche Tiere ---
    const maleOwnerAnimals = allAnimals.filter(anim => {
        // 1. Owner Check (Groß/Kleinschreibung ignorieren)
        const isOwner = anim.owner && address && (anim.owner.toLowerCase() === address.toLowerCase());

        // 2. Gender Check (Akzeptiert 1, "1" oder "Male")
        const isMale = anim.gender == 1 || anim.gender === '1' || anim.gender === 'Male';

        // 3. Spezies Check (muss gleich sein)
        // Achtung: Falls Spezies als Zahl (0 vs "0") kommt, hier auch locker prüfen
        const sameSpecies = anim.species == animal.species;

        // 4. Lebt das Tier noch?
        const isAlive = anim.dateOfDeath == 0 || anim.dateOfDeath === '0';

        return isOwner && isMale && sameSpecies && isAlive;
    });

    useEffect(() => {
        if (isModalOpen) {
            cancelButtonRef.current?.focus();
        }
    }, [isModalOpen]);

    const handleDeathClick = () => setModalOpen(true);

    const handleCancel = () => {
        setModalOpen(false);
        console.log("CANCELLED");
    };

    const confirm_pregnancy = async (id) => {
        // UI-Check: Ein Vater muss ausgewählt sein, auch wenn er nicht an den Contract gesendet wird
        if (maleId === null) {
            console.error("Kein Vater ausgewählt");
            return false;
        }

        try {
            console.log("Bereite Transaktion vor für Token ID:", id);

            // --- FIX: Args angepasst ---
            // Der Contract erwartet nur EINEN Parameter (uint256 _tokenId).
            // Wir senden 'maleId' NICHT mit, da die Funktion confirmPregnancy(uint256) heißt.
            const config = await prepareWriteContract({
                address: contract_address,
                abi: contract_abi,
                functionName: 'confirmPregnancy',
                args: [id] // Nur die ID der Mutter senden!
            });

            const transaction = await writeContract(config);
            console.log("Transaktion gesendet:", transaction);

            dispatch(setColor('green'));
            dispatch(setCountdown(5000));
            dispatch(setText('Pregnancy confirmed!'));
            dispatch(setLink(""));

            return true;
        } catch (error) {
            console.error("Fehler bei confirm_pregnancy:", error.message);
            return false;
        }
    }

    const handleConfirm = () => {
        setModalOpen(false);
        console.log("Bestätige Schwangerschaft für:", animal);

        confirm_pregnancy(animal.id)
            .then(success => {
                console.log("Erfolg:", success);
                setIsErrorOpen(success !== true);
            });
    };

    const handleMaleChange = (value) => {
        console.log("Vater ausgewählt ID:", value);
        setMaleId(value);
    };

    // Dropdown Optionen vorbereiten
    let owned_animals_selectorate = [{ "label": "Keine passenden Männchen gefunden", "value": null }];

    if (maleOwnerAnimals.length > 0) {
        owned_animals_selectorate = maleOwnerAnimals.map((anim) => ({
            label: `${anim.name} (ID: ${anim.id})`, // Zeigt Name und ID an
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
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 1000}}>
                    <div className="bg-white p-6 rounded shadow-lg">
                        <h3 className="text-lg font-bold mb-2">Vater auswählen</h3>
                        <p className="text-gray-800 mb-4">
                            Bitte wähle den Vater für die Dokumentation:
                        </p>

                        <div className="mb-4 text-black">
                            {maleOwnerAnimals.length > 0 ? (
                                <ReusableDropdown
                                    options={owned_animals_selectorate}
                                    onChange={handleMaleChange}
                                    store_adress={null}
                                    default_label="Wähle ein Männchen..."
                                />
                            ) : (
                                <p className="text-red-500 text-sm">Du besitzt kein passendes männliches Tier derselben Spezies.</p>
                            )}
                        </div>

                        <p className="text-gray-600 text-sm mb-4">
                            Bist du sicher? Diese Aktion wird auf der Blockchain gespeichert.
                        </p>

                        <div className="flex justify-end">
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 mr-2 rounded"
                                ref={cancelButtonRef}
                                onClick={handleCancel}
                            >
                                Abbrechen
                            </button>
                            <button
                                className={`font-bold py-2 px-4 rounded text-white ${maleId === null ? 'bg-pink-300 cursor-not-allowed' : 'bg-pink-600 hover:bg-pink-500'}`}
                                onClick={handleConfirm}
                                disabled={maleId === null}
                            >
                                Bestätigen
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isErrorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 1000}}>
                    <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded text-red-700">
                        <p className="font-bold">Fehler aufgetreten!</p>
                        <p className="mb-4">Die Transaktion konnte nicht durchgeführt werden.</p>
                        <button
                            className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded"
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