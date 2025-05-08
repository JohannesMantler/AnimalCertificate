import React, { useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchString } from '../redux/slices/sorterSlice';
import { useContractRead } from 'wagmi';
import AnimalCertificateABI from '../abis/AnimalCertificate.json';
import { Link } from "react-router-dom";

const Home = () => {
  const searchRef = useRef(null);
  const dispatch = useDispatch();

  const contract_supply = useContractRead({
    abi: AnimalCertificateABI,
    address: useSelector((state) => state.contract.address),
    functionName: 'totalSupply',
    watch: true,
  });

  const handleSearchClick = () => {
    if (searchRef.current) {
      dispatch(setSearchString(searchRef.current.value));
      window.location.href = "/animals/";
    }
  };

  return (
    <main className="p-8 mx-auto max-w-5xl glass-card mt-32">
      <h1 className="text-5xl md:text-7xl font-bold text-center soft-glow-text mb-6 font-inter">
        Animal Certificate
      </h1>

      <h2 className="text-xl text-center text-gray-300 font-medium mb-10">
        Introducing <span className="text-white font-semibold">Animal Certificate</span>: your pet’s digital identity 🐾
      </h2>

      {/* Search Bar */}
      <div className="flex justify-center mb-12">
        <div className="flex flex-col w-full max-w-md">
          <label className="text-sm text-gray-400 mb-2">Find a certificate</label>
          <div className="relative">
            <input
              ref={searchRef}
              type="text"
              placeholder="0x..."
              className="bg-transparent border-b-2 border-gray-400 text-white text-xl w-full focus:outline-none focus:border-blue-300"
            />
            <button
              onClick={handleSearchClick}
              className="absolute right-0 top-0 mt-2 text-sm underline text-blue-300 hover:no-underline"
            >
              [Find...]
            </button>
          </div>
          <Link to="/animals" className="mt-4 text-sm underline text-gray-300 hover:text-white">[Find all...]</Link>
        </div>
      </div>

      {/* Info Block */}
      <section className="mt-10">
        <h3 className="text-2xl font-semibold text-white mb-3">
          <span className="mr-2">&#9658;</span> Mission:
        </h3>
        <p className="text-lg text-gray-200 leading-relaxed">
          🌟 Welcome to the FUTURE of pet care! 🌟 <br />
          There are currently <strong>
            {contract_supply.isSuccess ? Number(contract_supply.data) : contract_supply.status}
          </strong> pets certified through our service.<br />
          {contract_supply.isError && <span className="text-red-400 text-sm">{contract_supply.error.toString()}</span>}
        </p>
      </section>
    </main>
  );
};

export default Home;
