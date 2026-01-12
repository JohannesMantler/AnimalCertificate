import React, { useState, useEffect, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { setCountdown, setColor, setText } from '../../redux/slices/tooltipSlice';
import { useAccount } from 'wagmi';
import ReusableDropdown from './ReusableDropdown';

// JWT Token aus deinem Code Snippet
const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4YzdmZmQyMS1iOTRhLTRhOWUtODc4Yi1iMTY0MjBhOTZlZGQiLCJlbWFpbCI6ImlmMjNiMTc0QHRlY2huaWt1bS13aWVuLmF0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjUxYTA3ODQxMGU1NjVmZTg0M2E5Iiwic2NvcGVkS2V5U2VjcmV0IjoiMzcyMzZmNDRlNTAxNGUyNTZkMGJiMmEzOTkyYzQ5ODExN2RmNzIxMDZmZGNkMTRmNzFmNDQ0MmQzMWU3ZWIxZSIsImV4cCI6MTc3NTQ3OTU2Nn0.LsynbOrbkACZZsnc4zd2ztSGb_Xxdh1Lym_go61P-DU';

const BirthButton = ({ animal }) => {
    const dispatch = useDispatch();
    const { address } = useAccount();

    const [isModalOpen, setModalOpen] = useState(false);
    const [isErrorOpen, setIsErrorOpen] = useState(false);
    const [childCount, setChildCount] = useState(2);
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

    // Initialisiere childrenData
    useEffect(() => {
        setChildrenData(prev => {
            const newData = [...prev];
            if (newData.length < childCount) {
                for (let i = newData.length; i < childCount; i++) {
                    newData.push({
                        name: '',
                        gender: 0,
                        color: 0,
                        file: null,
                        preview: null,
                        ipfsHash: '', // Hier speichern wir den Hash von Pinata
                        uploading: false // Status für Ladeanzeige
                    });
                }
            } else if (newData.length > childCount) {
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

    // Upload Logik (übernommen und angepasst für Liste)
    const handleFileSelect = async (index, e) => {
        const file = e.target.files[0];
        if (!file) return;

        // 1. Vorschau setzen & Upload Status aktivieren
        const previewUrl = URL.createObjectURL(file);
        setChildrenData(prev => {
            const newData = [...prev];
            newData[index] = {
                ...newData[index],
                file: file,
                preview: previewUrl,
                uploading: true,
                ipfsHash: '' // Reset Hash bei neuem Bild
            };
            return newData;
        });

        // 2. Upload zu Pinata
        try {
            const formData = new FormData();
            formData.append("file", file);

            const res = await fetch("https://api.pinata.cloud/pinning/pinFileToIPFS", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${PINATA_JWT}`
                },
                body: formData
            });

            const data = await res.json();

            if (!data || !data.IpfsHash) {
                throw new Error("Upload succeeded, but no IPFS hash returned.");
            }

            console.log(`✅ Image for child ${index + 1} uploaded:`, data.IpfsHash);

            // 3. Hash speichern & Status aktualisieren
            setChildrenData(prev => {
                const newData = [...prev];
                newData[index] = {
                    ...newData[index],
                    uploading: false,
                    ipfsHash: data.IpfsHash
                };
                return newData;
            });

            dispatch(setColor("green"));
            dispatch(setText("Bild erfolgreich hochgeladen!"));
            dispatch(setCountdown(2000));

        } catch (err) {
            console.error("❌ Upload error:", err);

            setChildrenData(prev => {
                const newData = [...prev];
                newData[index] = { ...newData[index], uploading: false };
                return newData;
            });

            dispatch(setColor("red"));
            dispatch(setText("Bild Upload fehlgeschlagen"));
            dispatch(setCountdown(3000));
        }
    };

    const confirm_birth = async () => {
        // Validierung: Namen & Upload Status
        const allNamed = childrenData.every(child => child.name && child.name.trim() !== '');
        const anyUploading = childrenData.some(child => child.uploading);

        if (!allNamed) {
            dispatch(setColor("red"));
            dispatch(setText("Namen fehlen!"));
            dispatch(setCountdown(3000));
            return false;
        }

        if (anyUploading) {
            dispatch(setColor("orange"));
            dispatch(setText("Bitte warten, Bilder werden noch hochgeladen..."));
            dispatch(setCountdown(3000));
            return false;
        }

        try {
            console.log(`Sende Geburtsdaten für ${childCount} Kinder an Blockchain...`);

            const names = childrenData.map(c => c.name);
            const genders = childrenData.map(c => c.gender);
            const colors = childrenData.map(c => c.color);

            // Verwende den gespeicherten IPFS Hash. Wenn keiner da ist, leerer String.
            const hashes = childrenData.map(c => c.ipfsHash || "");

            const config = await prepareWriteContract({
                address: contract_address,
                abi: contract_abi,
                functionName: 'reportBirth',
                args: [
                    animal.id,
                    names,
                    genders,
                    colors,
                    hashes
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
            dispatch(setColor("red"));
            dispatch(setText(error.message || "Fehler bei der Transaktion"));
            dispatch(setCountdown(4000));
            return false;
        }
    };

    const handleConfirm = () => {
        confirm_birth().then((success) => {
            if (success) {
                setModalOpen(false);
            } else {
                // Bei Fehler lassen wir das Modal offen, damit man korrigieren kann
                // setIsErrorOpen(true); -> Optional, oder wir nutzen Tooltips
            }
        });
    };

    const isFormValid = childrenData.length > 0 && childrenData.every(c => c.name.trim() !== '');
    // Check ob gerade noch etwas hochlädt
    const isUploading = childrenData.some(c => c.uploading);

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

                        <div className="mb-6 flex justify-center items-center gap-4">
                            <label className="font-bold">Anzahl der Kinder:</label>
                            <select
                                className="border p-2 rounded"
                                value={childCount}
                                onChange={(e) => setChildCount(parseInt(e.target.value))}
                            >
                                {[...Array(10)].map((_, i) => (
                                    <option key={i + 1} value={i + 1}>{i + 1}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            {childrenData.map((child, index) => (
                                <div key={index} className="p-3 border rounded bg-gray-50">
                                    <h3 className="font-bold mb-2 border-b pb-1 flex justify-between">
                                        Kind {index + 1}
                                        {child.uploading && <span className="text-xs text-blue-500 animate-pulse">Lade Bild...</span>}
                                        {!child.uploading && child.ipfsHash && <span className="text-xs text-green-600">✓ Bild bereit</span>}
                                    </h3>

                                    <div className="mb-3">
                                        <label className="block text-sm font-bold mb-1">Name</label>
                                        <input
                                            type="text"
                                            className="border p-2 w-full rounded"
                                            value={child.name}
                                            onChange={(e) => updateChild(index, 'name', e.target.value)}
                                            placeholder={`Name`}
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

                                    {/* BILD UPLOAD */}
                                    <div className="mb-3">
                                        <label className="block text-sm font-bold mb-1">Bild hochladen (Optional)</label>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            className="border p-2 w-full rounded text-sm bg-white"
                                            onChange={(e) => handleFileSelect(index, e)}
                                            disabled={child.uploading}
                                        />
                                    </div>

                                    {/* VORSCHAU */}
                                    {child.preview && (
                                        <div className="flex justify-center mb-2">
                                            <div className={`w-16 h-16 rounded-full overflow-hidden border-2 ${child.uploading ? 'border-blue-400' : 'border-green-500'} bg-gray-100 relative`}>
                                                <img
                                                    src={child.preview}
                                                    alt="Vorschau"
                                                    className={`w-full h-full object-cover ${child.uploading ? 'opacity-50' : ''}`}
                                                />
                                                {child.uploading && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-xs font-bold text-blue-800">...</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>

                        <div className="flex justify-end gap-2 mt-6">
                            <button
                                className="bg-gray-300 px-4 py-2 rounded font-bold text-gray-700"
                                onClick={() => setModalOpen(false)}
                                ref={cancelButtonRef}
                            >
                                Abbrechen
                            </button>
                            <button
                                className={`px-4 py-2 rounded font-bold text-white transition-all ${(!isFormValid || isUploading) ? 'bg-green-300 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                onClick={handleConfirm}
                                disabled={!isFormValid || isUploading}
                            >
                                {isUploading ? 'Warte auf Uploads...' : 'Bestätigen & Minten'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default BirthButton;