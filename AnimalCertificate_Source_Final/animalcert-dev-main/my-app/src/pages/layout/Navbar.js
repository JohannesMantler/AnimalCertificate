import React, { useState } from 'react';
import { Link } from "react-router-dom";
import EthAddress from "../bits/EthAddress";
import HamburgerButton from "../bits/HamburgerButton";
import ConnectWalletButton from "../bits/ConnectWalletButton";
import { useAccount } from 'wagmi';

const Navbar = () => {
  const { address, isConnected } = useAccount();
  const [active, setActive] = useState(true);

  const toggleBurger = () => setActive(!active);

  return (
    <>
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 w-full z-20 milky-glass shadow backdrop-blur-lg px-4 py-2 flex items-center">
        {/* Mobile Menu Toggle */}
        <HamburgerButton
          className="md:hidden mr-2"
          onClick={toggleBurger}
          active={active}
        />

        {/* Desktop Nav Links */}
        <ul className="hidden md:flex gap-x-4 items-center">
          <li><Link className="nav-link" to="/">Home</Link></li>
          <li><Link className="nav-link" to="/animals">Show All</Link></li>
          <li><Link className="nav-link" to="/animals/0">Animal ID 0</Link></li>
          {isConnected && (
            <li><Link className="nav-link" to={`/owner/${address}`}>Your Pets</Link></li>
          )}
        </ul>

        <div className="flex-grow" />

        {/* Right Side: Mint + Wallet */}
        <ul className="flex items-center gap-3">
          <li className="crypto-button">
            <Link to="/animals/new">Mint a Token</Link>
          </li>
          <ConnectWalletButton />
        </ul>
      </nav>

      {/* Mobile Slide-Out */}
      <nav className={`fixed top-0 left-0 w-full h-screen z-10 transition-all duration-300 ease-in-out
        grid content-center justify-center text-lg milky-glass backdrop-blur-xl
        ${active ? "-translate-x-full opacity-0" : "translate-x-0 opacity-100"}`}>
        <span className="nav-element" onClick={toggleBurger}><Link className="nav-link" to="/">Home</Link></span>
        <span className="nav-element" onClick={toggleBurger}><Link className="nav-link" to="/animals">Show All</Link></span>
        <span className="nav-element" onClick={toggleBurger}><Link className="nav-link" to="/animals/0">Animal ID 0</Link></span>
        {isConnected && (
          <span className="nav-element" onClick={toggleBurger}><Link className="nav-link" to={`/owner/${address}`}>Your Pets</Link></span>
        )}
      </nav>
    </>
  );
};

export default Navbar;
