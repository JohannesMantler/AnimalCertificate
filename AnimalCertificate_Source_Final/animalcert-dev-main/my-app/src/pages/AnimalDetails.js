import { Link, useParams } from 'react-router-dom';
import EthAddress from './bits/EthAddress';
import DeclareDeathButton from './bits/DeclareDeathButton';
import ConfirmPregnancyButton from './bits/ConfirmPregnancyButton';
import BirthButton from './bits/BirthButton';
import contract_abi from '../abis/AnimalCertificate.json';
import * as AnimalMaps from '../constants';
import { useSelector } from 'react-redux';
import { useAccount, useContractRead } from 'wagmi';
import { useEffect, useRef, useState } from "react";
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { ANIMAL_DISEASES } from "../constants";

const AnimalDetails = () => {
    const { id } = useParams();
    const contract_address = useSelector((state) => state.contract.address);
    const account = useAccount();

    const [imageUploading, setImageUploading] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageHash, setImageHash] = useState("");

   const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4YzdmZmQyMS1iOTRhLTRhOWUtODc4Yi1iMTY0MjBhOTZlZGQiLCJlbWFpbCI6ImlmMjNiMTc0QHRlY2huaWt1bS13aWVuLmF0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjUxYTA3ODQxMGU1NjVmZTg0M2E5Iiwic2NvcGVkS2V5U2VjcmV0IjoiMzcyMzZmNDRlNTAxNGUyNTZkMGJiMmEzOTkyYzQ5ODExN2RmNzIxMDZmZGNkMTRmNzFmNDQ0MmQzMWU3ZWIxZSIsImV4cCI6MTc3NTQ3OTU2Nn0.LsynbOrbkACZZsnc4zd2ztSGb_Xxdh1Lym_go61P-DU';


    const single_read_animal = useContractRead({
        abi: contract_abi,
        address: contract_address,
        functionName: 'getAnimal',
        args: [id],
        watch: true,
        enabled: !!contract_abi && !!contract_address && !!id,
    });

    const single_ownerOf_animal = useContractRead({
        abi: contract_abi,
        address: contract_address,
        functionName: 'ownerOf',
        args: [id],
        watch: true,
        enabled: !!contract_abi && !!contract_address && !!id,
    });

    const animal = single_read_animal.data;
    const owner = single_ownerOf_animal.data;

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageUploading(true);
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
            if (!data?.IpfsHash) throw new Error("No IPFS hash returned.");

            const ipfsHash = data.IpfsHash;
            const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

            setImageHash(ipfsHash);
            setImagePreview(imageUrl);
        } catch (err) {
            console.error("❌ Image upload failed:", err);
        } finally {
            setImageUploading(false);
        }
    };

    const updateAnimalImage = async () => {
        try {
            const config = await prepareWriteContract({
                address: contract_address,
                abi: contract_abi,
                functionName: 'updateImageHash',
                args: [id, imageHash]
            });

            const tx = await writeContract(config);
            console.log("✅ Image updated:", tx);
            single_read_animal.refetch();
        } catch (err) {
            console.error("❌ Failed to update image:", err);
        }
    };

    const abort_pregnancy = async (id) => {
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'abortPregnancy',
            args: [id]
        });
        try {
            await writeContract(config);
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    };

    const add_Disease = async (id, disease) => {
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'addDisease',
            args: [id, disease]
        });
        try {
            await writeContract(config);
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    };

    const remove_Disease = async (id, disease) => {
        const config = await prepareWriteContract({
            address: contract_address,
            abi: contract_abi,
            functionName: 'removeDisease',
            args: [id, disease]
        });
        try {
            await writeContract(config);
            return true;
        } catch (error) {
            console.log(error.message);
            return false;
        }
    };

    const AddDiseaseButton = () => {
        const [isModalOpen, setModalOpen] = useState(false);
        const [selectedDisease, setSelectedDisease] = useState(0);
        const cancelButtonRef = useRef(null);

        useEffect(() => {
            if (isModalOpen) cancelButtonRef.current?.focus();
        }, [isModalOpen]);

        const handleConfirm = () => {
            setModalOpen(false);
            add_Disease(animal.id, selectedDisease);
        };

        const SingleChoiceListOfPossibleDiseases = () => {
            const [possibleDiseases, setPossibleDiseases] = useState([]);

            useEffect(() => {
                const excluded = animal.diseases.concat(99).map(Number);
                const filtered = Object.fromEntries(
                    Object.entries(ANIMAL_DISEASES).filter(([key]) => !excluded.includes(Number(key)))
                );
                setPossibleDiseases(filtered);
            }, [animal.diseases]);

            return (
                <select
                    className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                    onChange={(e) => setSelectedDisease(Number(e.target.value))}
                    value={selectedDisease}
                >
                    {Object.entries(possibleDiseases).map(([key, value]) => (
                        <option key={key} value={key}>{value}</option>
                    ))}
                </select>
            );
        };

        return (
            <div>
                <button
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded"
                    onClick={() => setModalOpen(true)}
                >
                    Add Disease
                </button>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded">
                            <p className="text-gray-800 mb-4">Add disease</p>
                            <SingleChoiceListOfPossibleDiseases />
                            <button className="bg-green-600 text-white font-bold py-2 px-4 mt-4 ml-4 rounded" onClick={handleConfirm}>Confirm</button>
                            <button className="bg-gray-300 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded" ref={cancelButtonRef} onClick={() => setModalOpen(false)}>Cancel</button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    const RemoveDiseaseButton = () => {
        const [isModalOpen, setModalOpen] = useState(false);
        const [selectedDisease, setSelectedDisease] = useState(null);
        const cancelButtonRef = useRef(null);

        useEffect(() => {
            if (isModalOpen && animal?.diseases.length > 0) {
                setSelectedDisease(Number(animal.diseases[0]));
                cancelButtonRef.current?.focus();
            }
        }, [isModalOpen, animal]);

        const handleConfirm = () => {
            setModalOpen(false);
            if (selectedDisease != null) {
                remove_Disease(animal.id, selectedDisease)
                    .then((r) => r && single_read_animal.refetch());
            }
        };

        return (
            <div>
                <button
                    className="bg-blue-900 hover:bg-blue-800 text-white font-bold py-2 px-4 rounded ml-2"
                    onClick={() => setModalOpen(true)}
                >
                    Remove Disease
                </button>
                {isModalOpen && (
                    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                        <div className="bg-white p-6 rounded">
                            <p className="text-gray-800 mb-4">Select disease to remove</p>
                            <select
                                className="border-2 border-gray-300 bg-[#6b7280] h-10 px-5 pr-16 rounded-lg text-sm focus:outline-none"
                                onChange={(e) => setSelectedDisease(Number(e.target.value))}
                                value={selectedDisease ?? ''}
                            >
                                {animal.diseases.map((d) => (
                                    <option key={d} value={Number(d)}>
                                        {AnimalMaps.ANIMAL_DISEASES[Number(d)]}
                                    </option>
                                ))}
                            </select>
                            <button
                                className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 mt-4 ml-4 rounded"
                                onClick={handleConfirm}
                                disabled={selectedDisease == null}
                            >
                                Confirm
                            </button>
                            <button
                                className="bg-gray-300 hover:bg-gray-400 text-gray-700 font-bold py-2 px-4 ml-2 mt-4 rounded"
                                ref={cancelButtonRef}
                                onClick={() => setModalOpen(false)}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                )}
            </div>
        );
    };

    if (single_read_animal.isError) {
        return (
            <main className="p-8 text-white text-center">
                <h1 className="text-3xl font-bold mb-4">Animal Not Found</h1>
                <p>Could not load animal data for ID <b>{id}</b>.</p>
                <p className="text-sm mt-2 text-red-400">{single_read_animal.error?.message}</p>
            </main>
        );
    }

    return (
        <main className="p-4 rounded-lg w-full milky-glass border-2 border-solid border-neutral-200">
            {(single_read_animal.isLoading || single_ownerOf_animal.isLoading) ? (
                <>loading...</>
            ) : (
                (!single_read_animal.isError && !single_ownerOf_animal.isError && animal && owner) ? (
                    <div className="relative">
                        <div className="flex flex-col items-center">
                            <img
                                src={
                                    animal.imageHash?.startsWith('http')
                                        ? animal.imageHash
                                        : `https://gateway.pinata.cloud/ipfs/${animal.imageHash}` ?? AnimalMaps.ANIMAL_SPECIES_IMAGES[animal.species ?? 99n]
                                }
                                alt="Animal"
                                className="rounded-full border-white border-4 w-32 h-32 mx-auto mt-6 blue-glow-element"
                            />
                            <h2 className="text-3xl font-bold mt-4">Animal Name: {animal.name}</h2>
                            <div className="text-xl mt-1">Owner: <Link to={`/owner/${owner}`} className="underline"><EthAddress>{owner}</EthAddress></Link></div>
                            <div className="text-2xl">{animal.dateOfDeath > 0 ? <span className="text-7xl">❌</span> : ""}</div>
                            <div className="text-sm mt-2">
                                <span>Species: {AnimalMaps.ANIMAL_SPECIES[animal.species ?? 99n]}</span>
                                <span className="mx-2">|</span>
                                <span>Gender: {AnimalMaps.ANIMAL_GENDERS[animal.gender ?? 99n]}</span>
                                <span className="mx-2">|</span>
                                <span>Birthday: {new Date(Number(animal.dateOfBirth * 1000n)).toLocaleDateString('de-AT')}</span>
                            </div>
                            <div className="text-sm mt-1">
                                <span>Fur Color: {AnimalMaps.ANIMAL_COLORS[animal.furColor ?? 99n]}</span>
                                <span className="mx-2">|</span>
                                <span>Diseases: {animal.diseases.length > 0 ? animal.diseases.map((disease) => AnimalMaps.ANIMAL_DISEASES[Number(disease)]).join(", ") : "no known diseases"}</span>
                            </div>
                            <h3 className="text-3xl font-bold mt-8">Parents:</h3>
                            <Link to={`/ancestry/${Number(animal.id)}`} className="underline">Ancestral tree</Link>
                            <div>Mother {animal.mother}</div>
                            <div>Father {animal.father}</div>
                        </div>

                        {/* Centered action buttons */}
                        {animal.dateOfDeath <= 0 && account.address === owner && (
                            <>
                                <div className="mt-6 flex justify-center gap-4">
                                    <AddDiseaseButton />
                                    <RemoveDiseaseButton />
                                    <DeclareDeathButton animal={animal} />
                                </div>

                                {animal.pregnant !== null && (
                                    <div className="mt-4 flex justify-center gap-4">
                                        {animal.pregnant === false && animal.gender === 0 && <ConfirmPregnancyButton animal={animal} />}
                                        {animal.pregnant === true && <BirthButton animal={animal} />}
                                        {animal.pregnant === true && <AbortPregnancyButton />}
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                ) : (
                    <div className="text-white">
                        <p>An error occurred while loading Passport number <b>"{id}"</b>:</p>
                        <p>Status: animal: <i>{single_read_animal.status}</i>; ownerOf: <i>{single_ownerOf_animal.status}</i></p>
                        {single_read_animal.isError && <code>{single_read_animal.error.toString()}</code>}
                        {single_ownerOf_animal.isError && <code>{single_ownerOf_animal.error.toString()}</code>}
                    </div>
                )
            )}
        </main>
    );
};

export default AnimalDetails;
