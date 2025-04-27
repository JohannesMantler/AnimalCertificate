import { createSlice } from '@reduxjs/toolkit';


const tooltipSlice = createSlice({
    name: 'tooltip',
    initialState: {
        countdown: 0,
        color: "gray",
        text: '',
        link: '/',
    },
    reducers: {
        setCountdown: (state, action) => {
            state.countdown = action.payload;
        },
        setColor: (state, action) => {
            state.color = action.payload;
        },
        setText: (state, action) => {
            state.text = action.payload;
        },
        setLink: (state, action) => {
            state.link = action.payload;
        },
        
    },
});

export const { setCountdown, setColor, setText, setLink } = tooltipSlice.actions;
export default tooltipSlice.reducer;
