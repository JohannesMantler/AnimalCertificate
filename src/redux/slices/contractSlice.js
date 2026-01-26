import { createSlice } from '@reduxjs/toolkit';

import CONTRACT_ABI from '../../abis/AnimalCertificate.json';

const contractSlice = createSlice({
    name: 'contract',
    initialState: {
        abi: CONTRACT_ABI,
        address: '0xf5C8989BBf8ce418b1314F65cB15454742Ce7785',
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
