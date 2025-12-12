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

    // Anzahl der Kinder (Standard 2)
    const [childCount, setChildCount] = useState(2);
    // Speicher für die Daten aller Kinder
    const [childrenData, setChildrenData] = useState([]);

    const contract_abi = useSelector((state) => state.contract.abi);
    const contract_address = useSelector((state) => state.contract.address);
    const cancelButtonRef = useRef(null);

    const genderOptions = [{ label: 'Female', value: 0 }, { label: 'Male', value: 1 }];
    const colorOptions = [
        { label: 'Black', value: 0 }, { label: 'White', value: 1 },
        { label: 'Brown', value: 2 }, { label: 'Grey', value: 3 },
        { label: 'Red', value: 4 }, { label: 'Orange', value: 5 }
    ];

    // Initialisiere oder update childrenData basierend auf childCount
    useEffect(() => {
        setChildrenData(prev => {
            const newData = [...prev];
            if (newData.length < childCount) {
                // Füge fehlende Kinder hinzu
                for (let i = newData.length; i < childCount; i++) {
                    newData.push({ name: '', gender: 0, color: 0 });
                }
            } else if (newData.length > childCount) {
                // Entferne überschüssige Kinder
                newData.splice(childCount);
            }
            return newData;
        });
    }, [childCount]);

    const updateChild = (index, field, value) => {
        setChildrenData(prev => {
            const newData = [...prev];
            newData[index] = { ...newData[index], [field]: value };
            return newData;
        });
    };

    const confirm_birth = async () => {
        // Validierung: Haben alle Kinder einen Namen?
        const allNamed = childrenData.every(child => child.name && child.name.trim() !== '');
        if (!allNamed) {
            console.error("Namen fehlen für einige Kinder");
            return false;
        }

        try {
            console.log(`Sende Geburtsdaten für ${childCount} Kinder an Blockchain...`);

            // Wir bereiten die Arrays vor
            const names = childrenData.map(c => c.name);
            const genders = childrenData.map(c => c.gender);
            const colors = childrenData.map(c => c.color);
            // Generiere Placeholder Hashes
            const hashes = childrenData.map((_, i) => `QmDefaultHash${i + 1}`);

            // HINWEIS: Wir gehen davon aus, dass der Smart Contract nun Arrays akzeptiert
            const config = await prepareWriteContract({
                address: contract_address,
                abi: contract_abi,
                functionName: 'reportBirth',
                args: [
                    animal.id,  // Mutter ID
                    names,      // string[] names
                    genders,    // uint[] genders
                    colors,     // uint[] colors
                    hashes      // string[] hashes
                ]
            });

            const transaction = await writeContract(config);
            console.log("Transaktion erfolgreich:", transaction);

            dispatch(setColor('green'));
            dispatch(setCountdown(5000));
            dispatch(setText(`${childCount} Kinder geboren!`));

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

    // Validierung für den Button
    const isFormValid = childrenData.length > 0 && childrenData.every(c => c.name.trim() !== '');

    return (
        <>
            <button
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-2 px-4 rounded"
                onClick={() => setModalOpen(true)}
            >
                Report Birth
            </button>

            {isModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center" style={{zIndex: 1000}}>
                    <div className="bg-white p-6 rounded shadow-lg w-[800px] text-black overflow-y-auto max-h-[90vh]">
                        <h2 className="text-xl font-bold mb-4 text-center">Geburt melden</h2>
                        <p className="text-sm text-gray-500 mb-4 text-center">Der Vater ist durch die vorherige Paarung bereits festgelegt.</p>

                        {/* Auswahl der Anzahl */}
                        <div className="mb-6 flex justify-center items-center gap-4">
                            <label className="font-bold">Anzahl der Kinder:</label>
                            <select
                                className="border p-2 rounded"
                                value={childCount}
                                onChange={(e) => setChildCount(parseInt(e.target.value))}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Grid für die Kinder */}
                        <div className="grid grid-cols-2 gap-4">
                            {childrenData.map((child, index) => (
                                <div key={index} className="p-3 border rounded bg-gray-50">
                                    <h3 className="font-bold mb-2 border-b pb-1">Kind {index + 1}</h3>
                                    <div className="mb-3">
                                        <label className="block text-sm font-bold mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="border p-2 w-full rounded"
                                            value={child.name}
                                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                                            placeholder={`Name Kind ${index + 1}`}
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-bold mb-1">Geschlecht</label>
                                        <ReusableDropdown
                                            options={genderOptions}
                                            onChange={(val) => updateChild(index, 'gender', val)}
                                            default_label="Female"
                                        />
                                    </div>
                                    <div className="mb-3">
                                        <label className="block text-sm font-bold mb-1">Farbe</label>
                                        <ReusableDropdown
                                            options={colorOptions}
                                            onChange={(val) => updateChild(index, 'color', val)}
                                            default_label="Black"
                                        />
                                    </div>
                                </div>
                            ))}
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
                                className={`px-4 py-2 rounded font-bold text-white ${!isFormValid ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                onClick={handleConfirm}
                                disabled={!isFormValid}
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
                        <p>Transaktion fehlgeschlagen. Möglicherweise akzeptiert der Contract keine Arrays oder die Daten sind ungültig.</p>
                        <button className="mt-4 bg-red-500 text-white px-4 py-2 rounded" onClick={() => setIsErrorOpen(false)}>OK</button>
                    </div>
                </div>
            )}
        </>
    );
};

export default BirthButton;