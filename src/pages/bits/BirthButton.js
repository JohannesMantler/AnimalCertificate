import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { setCountdown, setColor, setLink, setText } from '../../redux/slices/tooltipSlice';
import { useAccount } from 'wagmi';
import ReusableDropdown from './ReusableDropdown';

const BirthButton = ({ animal }) => {
    const dispatch = useDispatch();
    const { address } = useAccount();

    // States für Modal
    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);

    // Daten für Kind 1
    const [child1Name, setChild1Name] = useState('');
    const [child1Gender, setChild1Gender] = useState(0); // 0 = Female
    const [child1Color, setChild1Color] = useState(0);   // 0 = Black

    // Daten für Kind 2
    const [child2Name, setChild2Name] = useState('');
    const [child2Gender, setChild2Gender] = useState(0); // 0 = Female
    const [child2Color, setChild2Color] = useState(0);   // 0 = Black

    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);
    const cancelButtonRef = useRef(null);

    const genderOptions = [{ label: 'Female', value: 0 }, { label: 'Male', value: 1 }];
    const colorOptions = [
        { label: 'Black', value: 0 }, { label: 'White', value: 1 },
        { label: 'Brown', value: 2 }, { label: 'Grey', value: 3 },
        { label: 'Red', value: 4 }, { label: 'Orange', value: 5 }
    ];

    const confirm_birth = async () => {
        if (!child1Name || !child2Name) {
            console.error("Namen für beide Kinder fehlen");
            return false;
        }

        try {
            console.log("Sende Zwillings-Geburtsdaten an Blockchain...");

            // Der Vater wird nun im Smart Contract automatisch über 'matePartner' ermittelt.
            // Wir senden Daten für 2 Kinder.
            const config = await prepareWriteContract({
                address: contract_address,
                abi: contract_abi,
                functionName: 'reportBirth',
                args: [
                    animal.id,          // Mutter ID
                    // Kind 1
                    child1Name,
                    child1Gender,
                    child1Color,
                    "QmDefaultHash1",   // Placeholder Hash 1
                    // Kind 2
                    child2Name,
                    child2Gender,
                    child2Color,
                    "QmDefaultHash2"    // Placeholder Hash 2
                ]
            });

            const transaction = await writeContract(config);
            console.log("Transaktion erfolgreich:", transaction);

            dispatch(setColor('green'));
            dispatch(setCountdown(5000));
            dispatch(setText('Zwillinge geboren!'));

            return true;
        } catch (error) {
            console.error("Fehler bei reportBirth:", error);
            return false;
        }
    };

    const handleConfirm = () => {
        confirm_birth().then((success) => {
            if (success) {
                setModalOpen(false);
            } else {
                setIsErrorOpen(true);
            }
        });
    };

    return (
        <>
            <button
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => setModalOpen(true)}
            >
                Report Birth (Zwillinge)
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 1000}}>
                    <div className="bg-white p-6 rounded shadow-lg w-[600px] text-black overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4 text-center">Geburt melden (Zwillinge)</h2>
                        <p className="text-sm text-gray-500 mb-4 text-center">Der Vater ist durch die vorherige Paarung bereits festgelegt.</p>

                        <div className="flex gap-4">
                            {/* Spalte Kind 1 */}
                            <div className="w-1/2 p-2 border rounded bg-gray-50">
                                <h3 className="font-bold mb-2 border-b pb-1">Kind 1</h3>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="border p-2 w-full rounded"
                                        value={child1Name}
                                        onChange={(e) => setChild1Name(e.target.value)}
                                        placeholder="Name Kind 1"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Geschlecht</label>
                                    <ReusableDropdown options={genderOptions} onChange={setChild1Gender} default_label="Female" />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Farbe</label>
                                    <ReusableDropdown options={colorOptions} onChange={setChild1Color} default_label="Black" />
                                </div>
                            </div>

                            {/* Spalte Kind 2 */}
                            <div className="w-1/2 p-2 border rounded bg-gray-50">
                                <h3 className="font-bold mb-2 border-b pb-1">Kind 2</h3>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Name</label>
                                    <input
                                        type="text"
                                        className="border p-2 w-full rounded"
                                        value={child2Name}
                                        onChange={(e) => setChild2Name(e.target.value)}
                                        placeholder="Name Kind 2"
                                    />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Geschlecht</label>
                                    <ReusableDropdown options={genderOptions} onChange={setChild2Gender} default_label="Female" />
                                </div>
                                <div className="mb-3">
                                    <label className="block text-sm font-bold mb-1">Farbe</label>
                                    <ReusableDropdown options={colorOptions} onChange={setChild2Color} default_label="Black" />
                                </div>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded font-bold text-gray-700"
                                onClick={() => setModalOpen(false)}
                                ref={cancelButtonRef}
                            >
                                Abbrechen
                            </button>
                            <button
                                className={`px-4 py-2 rounded font-bold text-white ${(!child1Name || !child2Name) ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                onClick={handleConfirm}
                                disabled={!child1Name || !child2Name}
                            >
                                Bestätigen & Minten
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {isErrorOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 1100}}>
                    <div className="bg-red-100 border-l-4 border-red-500 p-6 rounded text-red-700">
                        <p className="font-bold">Fehler</p>
                        <p>Transaktion fehlgeschlagen. Siehe Konsole (F12) für Details.</p>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setIsErrorOpen(false)}>OK</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BirthButton;