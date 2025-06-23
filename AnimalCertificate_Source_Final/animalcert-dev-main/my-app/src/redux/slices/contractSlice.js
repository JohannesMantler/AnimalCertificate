import { createSlice } from '@reduxjs/toolkit';

import CONTRACT_ABI from '../../abis/AnimalCertificate.json';

const contractSlice = createSlice({
    name: 'contract',
    initialState: {
        abi: CONTRACT_ABI,
        address: '0xd9145CCE52D386f254917e481eB44e9943F39138',
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
