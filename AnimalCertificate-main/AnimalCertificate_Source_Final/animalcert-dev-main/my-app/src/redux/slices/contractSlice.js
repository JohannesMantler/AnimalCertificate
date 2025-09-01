import { createSlice } from '@reduxjs/toolkit';

import CONTRACT_ABI from '../../abis/AnimalCertificate.json';

const contractSlice = createSlice({
    name: 'contract',
    initialState: {
        abi: CONTRACT_ABI,
        address: '0x36Ee3829CCFeFcF4044fE8ea75BbC7b86562FC23',
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
