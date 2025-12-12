import { createSlice } from '@reduxjs/toolkit';

import CONTRACT_ABI from '../../abis/AnimalCertificate.json';

const contractSlice = createSlice({
    name: 'contract',
    initialState: {
        abi: CONTRACT_ABI,
        address: '0x11993C46535b92f1D8DcFB8B677286e81FDAF04b', // <- Sepolia-Adresse! (Ändern hier und in web3context.js bei neuem Deployment)
    },
    reducers: {
        setAbi: (state, action) => {
            state.abi = action.payload;
        },
        setAddress: (state, action) => {
            state.address = action.payload;
        },
        
    },
});

export const { setAbi, setAddress } = contractSlice.actions;
export default contractSlice.reducer;
