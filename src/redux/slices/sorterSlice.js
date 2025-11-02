import { createSlice } from '@reduxjs/toolkit';


const sorterSlice = createSlice({
    name: 'sorter',
    initialState: {
        sort_by: "",
        sort_dir: true, // true = ascending, false = descending
        search_string: "",
        address_search_string: "", // used adress search on main page
        
        ultimate_search_string: "", // used for full all search (nth)

    },
    reducers: {
        setSortBy: (state, action) => {
            state.sort_by = action.payload;
        },
        setSortDirection: (state, action) => {
            state.sort_dir = action.payload;
        },
        setSearchString: (state, action) => {
            state.search_string = action.payload;
        },
        setAddressSearchString: (state, action) => {
            state.address_search_string = action.payload;
        },
        setUltimateSearchString: (state, action) => {
            state.ultimate_search_string = action.payload;
        },
    },
});

export const {
    setSortBy,
    setSortDirection,
    setSearchString,
    setAddressSearchString,
    setUltimateSearchString, 
} = sorterSlice.actions;

export default sorterSlice.reducer;