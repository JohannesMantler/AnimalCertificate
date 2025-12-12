import { createContext } from 'react';
import Web3 from 'web3';
import CONTRACT_ABI from '../abis/AnimalCertificate.json';

const SEPOLIA_DEC = 11155111;
const SEPOLIA_HEX = '0xaa36a7';
const SEPOLIA_RPC = 'https://sepolia.infura.io/v3/88367459424444b6bd970a6a812a2098';
const CONTRACT_ADDRESS = '0xf5C8989BBf8ce418b1314F65cB15454742Ce7785'; // <- Sepolia-Adresse!(Ändern hier und in contractSlice.js bei neuem Deployment)

async function ensureSepoliaChain() {
  const { ethereum } = window;
  if (!ethereum) return; // kein MM → read-only RPC nutzt ohnehin Sepolia

  // Verbindung herstellen (zeigt ggf. den Connect-Dialog)
  await ethereum.request({ method: 'eth_requestAccounts' });

  // aktuelle Chain prüfen
  const chainId = await ethereum.request({ method: 'eth_chainId' });
  if (chainId !== SEPOLIA_HEX) {
    try {
      await ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: SEPOLIA_HEX }],
      });
    } catch (err) {
      // Sepolia ist in MM noch nicht hinzugefügt
      if (err.code === 4902) {
        await ethereum.request({
          method: 'wallet_addEthereumChain',
          params: [{
            chainId: SEPOLIA_HEX,
            chainName: 'Sepolia',
            nativeCurrency: { name: 'SepoliaETH', symbol: 'ETH', decimals: 18 },
            rpcUrls: [SEPOLIA_RPC],
            blockExplorerUrls: ['https://sepolia.etherscan.io'],
          }],
        });
      } else {
        throw err;
      }
    }
  }
}

export class Web3Data {
  constructor() {
    this.web3 = null;
    this.address = null;
    this.contract = null;
    this.defaults();
  }

  async defaults() {
    // Read-only: immer Sepolia-RPC
    this.web3 = new Web3(new Web3.providers.HttpProvider(SEPOLIA_RPC));
    this.updateContract();

    // falls Wallet vorhanden → Adresse optional setzen (ohne Zwang)
    try {
      const { ethereum } = window;
      if (ethereum) {
        const accts = await ethereum.request({ method: 'eth_accounts' });
        if (accts && accts.length) this.address = accts[0];
        // Events
        ethereum.on?.('accountsChanged', (a) => { this.address = a[0] || null; });
        ethereum.on?.('chainChanged', () => { /* ggf. UI neu laden */ });
      }
    } catch {}
    return this;
  }

  updateContract() {
    this.contract = new this.web3.eth.Contract(CONTRACT_ABI.abi, CONTRACT_ADDRESS);
  }

  async updateAddressAsync() {
    const accounts = await this.web3.eth.getAccounts();
    this.address = accounts[0];
    return this;
  }

  // Nutzer klickt "Connect Wallet"
  async connectWallet() {
    const { ethereum } = window;
    if (!ethereum) throw new Error('Keine Wallet gefunden');

    // **WICHTIG**: erst Sepolia sicherstellen
    await ensureSepoliaChain();

    // Provider NACH dem Switch erstellen
    this.web3 = new Web3(ethereum);
    const accounts = await ethereum.request({ method: 'eth_accounts' });
    this.address = accounts[0];

    // Events
    ethereum.on?.('disconnect', this.defaults.bind(this));
    ethereum.on?.('accountsChanged', (a) => { this.address = a[0] || null; });

    this.updateContract();
    return this;
  }

  // Beispiel: vor jedem Mint aufrufen (stellt Sepolia sicher)
  async prepareTx() {
    await ensureSepoliaChain();
    // Provider aktualisieren (falls vorher read-only RPC aktiv war)
    if (window.ethereum) this.web3 = new Web3(window.ethereum);
    this.updateContract();
    if (!this.address) {
      const accts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      this.address = accts[0];
    }
  }
}

export const Web3Context = createContext();
