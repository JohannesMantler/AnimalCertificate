import { createContext } from 'react';
import Web3 from 'web3';

import CONTRACT_ABI from '../abis/AnimalCertificate.json';


export class Web3Data{
    constructor(){
        this.web3 = null;
        this.address = null;
        this.contract = null;
        
        this.defaults();
    }
    
    defaults(){
        let provider;
        if (window.ethereum && window.ethereum.selectedAddress) {
            provider = new Web3(window.ethereum);
            
        } else {
            provider = new Web3(new Web3.providers.HttpProvider('https://sepolia.infura.io/v3/88367459424444b6bd970a6a812a2098'));

        }
        this.web3 = provider;
        
        this.updateContract();
        
        return this;
    }
    
    //contractAdress from Remix
    updateContract(){
        const contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
        const newContract = new this.web3.eth.Contract(CONTRACT_ABI.abi, contractAddress);
        this.contract = newContract;
        console.log("Updated contract:", this.contract.methods.mint);
    }
    
    async updateAddressAsync(){
        const accounts = await this.web3.eth.getAccounts();
        console.log(accounts);
        this.address = accounts[0];
    
        return this;
    }
    
    
    
    async connectWallet(){
        console.log("c: ", this)
        if (window.ethereum) {
            await window.ethereum.enable();
            const provider = new Web3(window.ethereum);
            this.web3 = provider;

            const accounts = await this.web3.eth.getAccounts();
            console.log(accounts);
            this.address = accounts[0];
        } else if (window.web3) {
            const provider = new Web3(window.web3.currentProvider);
            this.web3 = provider;
        }
        
        this.web3.currentProvider.on('disconnect', this.defaults.bind(this) );
        
        this.updateContract();
        
        console.log("c_data: ", this)
        
        return this;
    }
    
};

export const Web3Context = createContext();
