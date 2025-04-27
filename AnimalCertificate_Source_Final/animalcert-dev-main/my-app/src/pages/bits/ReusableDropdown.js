import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ReusableDropdown = ({ options, onChange, store_adress, default_label }) => {
    const value = store_adress!==null?useSelector(store_adress):null;
    const [isOpen, setIsOpen] = useState(false);
    const [localLabel, setLocalLabel] = useState(default_label? default_label : "none");

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setLocalLabel(options.find((option) => option.value === optionValue)?.label);
        setIsOpen(false);
    };
    
    useEffect(() => {
        if(store_adress!==null){
            setLocalLabel(options.find((option) => option.value === value)?.label);
        } 
    }, [value]);

    return (
        <div className="relative">
            <div>
                <button
                    type="button"
                    onClick={() => setIsOpen(!isOpen)}
                    className={`
                    ${isOpen ? 'border border-sky-500' : '' } 
                    px-4 py-2
                    rounded-lg shadow-sm  
                    text-sm font-medium text-neutral-900
                    
                    w-36 
                    
                    bg-white hover:bg-neutral-200 transition-all
                    `}
                >
                    {localLabel}
                    <span className="float-right ml-2">&#9660;</span>
                </button>
            </div>
            <div
                className={`
                    ${isOpen ? 'block' : 'hidden' } 
                    z-10 absolute w-full 
                    mt-1
                    rounded-sm shadow-lg backdrop-blur-sm
                    border border-white
                `}
            >
                {options.map((option) => (
                    <div
                        key={option.value}
                        onClick={() => handleOptionClick(option.value)}
                        className={`
                            ${option.value === value ? 'rounded-sm border-2 border-fuchsia-500' : ''} 
                            py-1 px-4
                            bg-white bg-opacity-20 hover:bg-opacity-40
                            cursor-pointer transition-all
                        `}
                    >
                        <span>
                            {option.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default ReusableDropdown;
