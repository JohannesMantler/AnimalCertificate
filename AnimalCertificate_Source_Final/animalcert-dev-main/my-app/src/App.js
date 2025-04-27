import './App.css';

import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from "react-router-dom";

import Layout from "./pages/layout/Layout";
import Home from "./pages/Home";
import Nft from "./pages/About";
import ShowAll from './pages/ShowAll';
import NoPage from "./pages/NoPage";

import AnimalDetails from './pages/AnimalDetails';
import AnimalsByOwner from './pages/AnimalsByOwner';
import AnimalPedigree from './pages/AnimalPedigree';

import MintAnimal from './pages/migrated views/MintAnimal';



const App = () => {

    
    
    
    return(
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Layout/>}>
                    <Route index element={<Home />} />
                    <Route path="nft" element={<Nft />} />
                    <Route path="animals">
                        <Route index exact element={<ShowAll/>} />
                        <Route path="new" exact element={<MintAnimal />} />
                        <Route path=":id" element={<AnimalDetails />} />
                    </Route>
                    <Route path="owner/:id" element={<AnimalsByOwner />} />
                    <Route path="ancestry/:id" element={<AnimalPedigree />} />
                    <Route path="*" element={<NoPage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );

    
}

export default App;
