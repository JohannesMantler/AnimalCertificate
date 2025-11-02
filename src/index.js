import React from 'react';
import ReactDOM from 'react-dom'

import { Provider } from 'react-redux';
import { PersistGate } from 'redux-persist/integration/react';
import store, { persistor } from './redux/store';

import './index.css';
import App from './App';

import { createWeb3Modal, defaultWagmiConfig } from '@web3modal/wagmi/react'
import {WagmiConfig, configureChains, sepolia} from 'wagmi'

import { infuraProvider } from 'wagmi/providers/infura'
import { publicProvider } from 'wagmi/providers/public'

import reportWebVitals from './reportWebVitals';
import { Analytics } from '@vercel/analytics/react';


// 1. Get projectId
const projectId = '989f374923febd2142d99fd237e948d5'

// 2. Create wagmiConfig
const metadata = {
  name: 'Web3Modal',
  description: 'Web3Modal Example',
  url: 'https://web3modal.com',
  icons: ['https://avatars.githubusercontent.com/u/37784886']
}

// Configure chains & providers with the Alchemy provider.
// Two popular providers are Alchemy (alchemy.com) and Infura (infura.io)
const { chains, publicClient, webSocketPublicClient } = configureChains(
  [ sepolia ],
  [infuraProvider({ apiKey: '5f544c19cfab4eb09869cab2a266d6f7' }), publicProvider()],
)

// Set up wagmi config
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata })

// 3. Create modal
createWeb3Modal({ wagmiConfig, projectId, chains })

ReactDOM.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <WagmiConfig config={wagmiConfig}>
        <App />
        <Analytics />
      </WagmiConfig>
    </PersistGate>
  </Provider>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
