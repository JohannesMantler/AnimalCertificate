import RadialMenu from "../bits/RadialMenu";
import * as AnimalMaps from "../../constants";
import React, { useState } from "react";
import { useSelector, useDispatch } from 'react-redux';
import { prepareWriteContract, writeContract } from "wagmi/actions";
import { setCountdown, setColor, setLink, setText } from '../../redux/slices/tooltipSlice';
import contract_abi from '../../abis/AnimalCertificate.json';

const PINATA_JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiI4YzdmZmQyMS1iOTRhLTRhOWUtODc4Yi1iMTY0MjBhOTZlZGQiLCJlbWFpbCI6ImlmMjNiMTc0QHRlY2huaWt1bS13aWVuLmF0IiwiZW1haWxfdmVyaWZpZWQiOnRydWUsInBpbl9wb2xpY3kiOnsicmVnaW9ucyI6W3siZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiRlJBMSJ9LHsiZGVzaXJlZFJlcGxpY2F0aW9uQ291bnQiOjEsImlkIjoiTllDMSJ9XSwidmVyc2lvbiI6MX0sIm1mYV9lbmFibGVkIjpmYWxzZSwic3RhdHVzIjoiQUNUSVZFIn0sImF1dGhlbnRpY2F0aW9uVHlwZSI6InNjb3BlZEtleSIsInNjb3BlZEtleUtleSI6IjUxYTA3ODQxMGU1NjVmZTg0M2E5Iiwic2NvcGVkS2V5U2VjcmV0IjoiMzcyMzZmNDRlNTAxNGUyNTZkMGJiMmEzOTkyYzQ5ODExN2RmNzIxMDZmZGNkMTRmNzFmNDQ0MmQzMWU3ZWIxZSIsImV4cCI6MTc3NTQ3OTU2Nn0.LsynbOrbkACZZsnc4zd2ztSGb_Xxdh1Lym_go61P-DU';


const MintAnimal = () => {
  const dispatch = useDispatch();
  const contract_address = useSelector((state) => state.contract.address);

  const [loading, setLoading] = useState(false);
  const [imageUploading, setImageUploading] = useState(false);
  const [diseases, setDiseases] = useState([]);
  const [vacccinations, setVacccinations] = useState([]);
  const [furColor, setFurColor] = useState('');
  const [species, setSpecies] = useState('');
  const [gender, setGender] = useState('');
  const [name, setName] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [imageHash, setImageHash] = useState('');
  const [imagePreview, setImagePreview] = useState(null);
  const [showSecurityMessage, setShowSecurityMessage] = useState(false);


 const handleDiseasesChange = (e) =>
  setDiseases(Array.from(e.target.selectedOptions, o => Number(o.value)));

const handleVaccinationsChange = (e) =>
  setVaccinations(Array.from(e.target.selectedOptions, o => Number(o.value)));


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

      if (!data || !data.IpfsHash) {
        throw new Error("Image upload succeeded, but no IPFS hash was returned.");
      }

      const ipfsHash = data.IpfsHash;
      const imageUrl = `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;

      console.log("✅ Image uploaded to:", imageUrl);

      setImageHash(ipfsHash);
      setImagePreview(imageUrl);

      dispatch(setColor("green"));
      dispatch(setText("Image uploaded to IPFS via Pinata"));
      dispatch(setCountdown(3000));
    } catch (err) {
      console.error("❌ Upload error:", err);
      dispatch(setColor("red"));
      dispatch(setText("Image upload failed"));
      dispatch(setCountdown(3000));
    } finally {
      setImageUploading(false);
    }
  };

  const mint = async (gender, species, name, birthdate, diseases, vaccinations, furColor, imageHash) => {
    try {
      console.log("🔵 Starting mint function...");
  
      const config = await prepareWriteContract({
        address: contract_address,
        abi: contract_abi,
        functionName: 'mint',
        args: [gender, species, name, birthdate, diseases, furColor, imageHash]
      });
  
      console.log("✅ prepareWriteContract successful:", config);
  
      const transaction = await writeContract(config);
      console.log("✅ writeContract successful:", transaction);
  
      const url = `https://sepolia.etherscan.io/tx/${transaction.hash}`;
      dispatch(setColor('green'));
      dispatch(setCountdown(5000));
      dispatch(setText('Animal minted successfully!'));
      dispatch(setLink(<a href={url} target="_blank" rel="noopener noreferrer">{transaction.hash}</a>));
      setShowSecurityMessage(true);
  
    } catch (error) {
      console.error("❌ Minting failed:", error);
      dispatch(setColor('red'));
      dispatch(setCountdown(5000));
      dispatch(setText(error.message || "Minting failed"));
      dispatch(setLink(''));
    }
  };
  

  return (
    <main className="mb-4 p-4 rounded-lg w-full milky-glass border-2 border-solid border-neutral-200">
      <h1 className="page-heading">Issue Token</h1>

      {!loading ? (
        <form
          onSubmit={(event) => {
            event.preventDefault();
            setLoading(true);

            const unixTimestamp = Math.floor(new Date(birthdate).getTime() / 1000);

            const parsedDiseases = diseases.map((d) => Number(d));
            const parsedVacccinations = vacccinations.map((d) => Number(d));

            console.log("Mint args:", {
              gender: parseInt(gender),
              species: parseInt(species),
              name: name.trim(),
              birthdate: unixTimestamp,
              diseases: parsedDiseases,
              vacccinations: parsedVacccinations,
              furColor: parseInt(furColor),
              imageHash: imageHash.trim().replace(/^https:\/\/[^/]+\/ipfs\//, '')
            });

            if (
              !furColor ||
              !species ||
              !gender ||
              !name ||
              !birthdate ||
              !imageHash ||
              imageHash === "" ||
              imageHash.includes("undefined")
            ) {
              dispatch(setColor("red"));
              dispatch(setCountdown(3000));
              dispatch(setText("Please fill all fields and upload a valid image."));
              dispatch(setLink(""));
              setLoading(false);
              return;
            }

            mint(
              parseInt(gender),
              parseInt(species),
              name.trim(),
              unixTimestamp,
              parsedDiseases,
              parsedVacccinations,
              parseInt(furColor),
              imageHash.trim().replace(/^https:\/\/[^/]+\/ipfs\//, '')
            ).finally(() => setLoading(false));
          }}

          className='mx-10'
        >
          <input
            type='text'
            placeholder='Ent a name for your animal'
            onChange={(e) => setName(e.target.value)}
            value={name}
            required
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:border-blue-500 block w-full p-2.5 border-2 border-white placeholder-white placeholder-opacity-70'
          />
          <select
            onChange={(e) => setSpecies(e.target.value)}
            value={species}
            required
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:bg-white focus:text-neutral-800 focus:border-sky-300 block w-full p-2.5 border-2 border-white'
          >
            <option value='' disabled>Select an animal species</option>
            {Object.entries(AnimalMaps.ANIMAL_SPECIES).map(([key, value]) =>
              key !== '99' && <option key={key} value={key}>{value}</option>
            )}
          </select>
          <select
            onChange={(e) => setGender(e.target.value)}
            value={gender}
            required
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:bg-white focus:text-neutral-800 focus:border-sky-300 block w-full p-2.5 border-2 border-white'
          >
            <option value='' disabled>Select a gender</option>
            {Object.entries(AnimalMaps.ANIMAL_GENDERS).map(([key, value]) =>
              key !== '99' && <option key={key} value={key}>{value}</option>
            )}
          </select>
          <input
            type='date'
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required
            max={new Date().toISOString().split("T")[0]}
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:border-sky-300 block w-full p-2.5 border-2 border-white placeholder-white placeholder-opacity-70'
          />
          <select
            multiple
            onChange={handleDiseasesChange}
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:bg-white focus:text-neutral-800 focus:border-sky-300 block w-full p-2.5 border-2 border-white'
          >
            <option disabled value="">Select diseases</option>
            {Object.entries(AnimalMaps.ANIMAL_DISEASES).map(([key, value]) =>
              key !== "99" && <option key={key} value={key}>{value}</option>
            )}
          </select>
          <select
            multiple
            onChange={handleVaccinationsChange}
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:bg-white focus:text-neutral-800 focus:border-sky-300 block w-full p-2.5 border-2 border-white'
          >
            <option disabled value="">Select Vaccinations</option>
            {Object.entries(AnimalMaps.ANIMAL_VACCINATIONS).map(([key, value]) =>
              key !== "99" && <option key={key} value={key}>{value}</option>
            )}
          </select>
          <select
            onChange={(e) => setFurColor(e.target.value)}
            value={furColor}
            required
            className='my-5 form-control bg-transparent text-white text-sm rounded-lg focus:bg-white focus:text-neutral-800 focus:border-sky-300 block w-full p-2.5 border-2 border-white'
          >
            <option value='' disabled>Select a fur color</option>
            {Object.entries(AnimalMaps.ANIMAL_COLORS).map(([key, value]) =>
              key !== '99' && <option key={key} value={key}>{value}</option>
            )}
          </select>

            <div className="flex flex-col items-center justify-center">
              <label
                htmlFor="imageUpload"
                className="cursor-pointer bg-gradient-to-r from-blue-500 to-indigo-600 text-white px-6 py-3 rounded-2xl shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-indigo-700 transition-all duration-300 ease-in-out text-lg font-medium flex items-center gap-2 w-full justify-center"
              >
                <span role="img" aria-label="camera" className="text-xl">📷</span>
                Upload Animal Image
              </label>
              <input
                id="imageUpload"
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="hidden"
              />
            </div>


          {imagePreview && (
            <div className="my-4 text-center">
              <img src={imagePreview} alt="Animal Preview" className="rounded-lg border border-white w-full max-w-xs mx-auto" />
            </div>
          )}

          <input
            type='submit'
            disabled={imageUploading}
            className='cursor-pointer px-4 py-2 rounded-lg shadow-sm text-sm font-medium text-neutral-900 bg-white hover:bg-neutral-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed'
            value='MINT'
          />
        </form>
      ) : (
        <div className="flex h-screen items-center justify-center flex-col">
          <h1 className="text-4xl font-bold text-center mb-4 text-white">Loading...</h1>
          <p className="text-lg text-center text-white">Check your wallet for confirmation...</p>
        </div>
      )}
      {showSecurityMessage && (
  <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
    <div className="bg-white text-black p-6 rounded-xl shadow-lg max-w-sm w-full text-center">
      <h2 className="text-xl font-semibold mb-4">Please Note</h2>
      <p>For security reasons, it takes up to 2 minutes before the minted token is shown.</p>
      <button
        onClick={() => setShowSecurityMessage(false)}
        className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
      >
        OK
      </button>
    </div>
  </div>
)}

    </main>
  );
};

export default MintAnimal;
