import { createSlice } from '@reduxjs/toolkit';


const mergeArraysRemovingDuplicates = (array, itemsToAdd) => {
    const existingIds = new Set(array.map(item => item.id));
    return [...array, ...itemsToAdd.filter(item => !existingIds.has(item.id))];
};

const animalSlice = createSlice({
    name: 'animals',
    initialState: {
        supply: 0,
        animals: [],
        owners: [],
        lastUpdateAnimal: new Date(0).getTime(),
        lastUpdateOwner: new Date(0).getTime(),
        lastUpdateSupply: new Date(0).getTime(),
    },
    reducers: {
        addAnimal: (state, action) => {
            state.animals.push(action.payload);
            state.lastUpdateAnimal = Date.now();
        },
        extendAnimals: (state, action) => {
            state.animals.push(...action.payload);
            state.lastUpdateAnimal = Date.now();
        },
        removeAnimal: (state, action) => {
            state.animals = state.animals.filter(animal => animal.id !== action.payload);
            state.lastUpdateAnimal = Date.now();
        },
        clearAnimals: (state) => {
            state.animals = [];
            state.lastUpdateAnimal = Date.now();
        },
        mergeAnimals: (state, action) => {
            console.log("🧬 Merging animals into Redux:", action.payload);
            state.animals = mergeArraysRemovingDuplicates(state.animals, action.payload);
            state.lastUpdateAnimal = Date.now();
        },
        addOwner: (state, action) => {
            state.owners.push(action.payload);
            state.lastUpdateOwner = Date.now();
        },
        extendOwners: (state, action) => {
            state.owners.push(...action.payload);
            state.lastUpdateOwner = Date.now();
        },
        removeOwner: (state, action) => {
            state.owners = state.owners.filter(owner => owner.id !== action.payload);
            state.lastUpdateOwner = Date.now();
        },
        clearOwners: (state) => {
            state.owners = [];
            state.lastUpdateOwner = Date.now();
        },
        mergeOwners: (state, action) => {
            state.owners = mergeArraysRemovingDuplicates(state.owners, action.payload);
            state.lastUpdateOwner = Date.now();
        },
        setSupply: (state, action) => {
            state.supply = action.payload;
            state.lastUpdateSupply = Date.now();
        },
    },
});

export const {
    addAnimal, extendAnimals, removeAnimal, clearAnimals, mergeAnimals,
    addOwner, extendOwners, removeOwner, clearOwners, mergeOwners,
    setSupply
} = animalSlice.actions;

export default animalSlice.reducer;