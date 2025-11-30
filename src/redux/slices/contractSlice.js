import { createSlice } from '@reduxjs/toolkit';

import CONTRACT_ABI from '../../abis/AnimalCertificate.json';

const contractSlice = createSlice({
    name: 'contract',
    initialState: {
        abi: CONTRACT_ABI,
        address: '0xd706Da7DEE1802282659208dA3D6fbDB81a42EdB',
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
