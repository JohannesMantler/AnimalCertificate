import React, { useState, useEffect } from 'react';
import { Link } from "react-router-dom";
import EthAddress from "../bits/EthAddress";
import HamburgerButton from "../bits/HamburgerButton";
import ConnectWalletButton from "../bits/ConnectWalletButton";

import {
  useAccount
} from 'wagmi'

import { useSelector, useDispatch } from 'react-redux';


const Navbar = () => {

  const { address, isConnected } = useAccount()


  const [active, setActive] = useState(true);
  
  const handleConnectWallet = () => {
    console.log("connect...")
  };
  

  const toggleBurger = () => {
    setActive(!active);
  };

  return (
    <React.Fragment>
      <nav className="
        flex items-center
        fixed top-0 left-0 w-screen z-20
        milky-glass shadow
        select-none  
      ">
        <HamburgerButton
          className="
          w-fit md:w-0
          mx-2
          md:hidden
        "
          onClick={toggleBurger.bind(this)}
          
          active={active}

        ></HamburgerButton>

        <ul className="
        hidden md:flex gap-x-2 flex-nowrap justify-center items-center
        px-2
        h-full
      ">
          <li className="nav-element">
            <Link className="nav-link" to="/">Home</Link>
          </li>
          <li className="nav-element">
            <Link className="nav-link" to="/animals">Show all</Link>
          </li>
          <li className="nav-element">
            <Link className="nav-link" to="/animals/0">Animal with ID 0</Link>
          </li>

          {isConnected &&
            <li className="nav-element">
              <Link className="nav-link" to={"/owner/" + address}>Your Pets</Link>
            </li>
          }
        </ul>

        <div
          className="
          grow
        "
        ></div>

        <ul className="
        
        flex gap-x-2 gap-y-2.5 flex-nowrap float-right
        w-fit
        px-4 py-2.5 
      ">
          <li className="crypto-button">
            <Link to="/animals/new">Mint a token</Link>
          </li>


          <ConnectWalletButton />
        </ul>
      </nav>

      <nav name="burgerPane"
        className={
          (active ? "-translate-x-full opacity-0 " : "translate-x-0 opacity-100 ") +
          "fixed top-0 left-0 w-screen h-screen z-10 " +
          "grid  gap-1 content-center justify-center text-lg " +
          "milky-glass transition-all"
        }
      >
        <span 
          className="nav-element"
          onClick={toggleBurger}
        >
          <Link className="nav-link" to="/">Home</Link>
        </span>
        <span className="nav-element" onClick={toggleBurger}>
          <Link className="nav-link" to="/animals">Show all</Link>
        </span>
        <span className="nav-element" onClick={toggleBurger}>
          <Link className="nav-link" to="/animals/0">Animal with ID 0</Link>
        </span>
        

        {isConnected &&
            <span className="nav-element" onClick={toggleBurger}>
              <Link className="nav-link" to={"/owner/" + address}>Your Pets</Link>
            </span>
            
        }

      </nav>
    </React.Fragment>
  );
};

export default Navbar;

