import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';

const ReusableDropdown = ({ options, onChange, store_adress, default_label }) => {
    const value = store_adress ? useSelector(store_adress) : null;
    const [isOpen, setIsOpen] = useState(false);
    const [localLabel, setLocalLabel] = useState(default_label || "Select");

    const handleOptionClick = (optionValue) => {
        onChange(optionValue);
        setLocalLabel(options.find(opt => opt.value === optionValue)?.label);
        setIsOpen(false);
    };

    useEffect(() => {
        if (store_adress) {
            setLocalLabel(options.find(opt => opt.value === value)?.label);
        }
    }, [value]);

    return (
        <div className="relative w-36">
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className={`w-full px-4 py-2 text-sm font-medium text-gray-900 rounded-lg bg-white shadow-sm hover:bg-gray-100 border ${isOpen ? 'border-blue-400' : 'border-white'}`}
            >
                {localLabel}
                <span className="float-right ml-2">&#9660;</span>
            </button>

            {isOpen && (
                <div className="absolute z-10 w-full mt-1 border border-white rounded-sm shadow-lg backdrop-blur-sm bg-white bg-opacity-20">
                    {options.map((opt) => (
                        <div
                            key={opt.value}
                            onClick={() => handleOptionClick(opt.value)}
                            className={`px-4 py-2 cursor-pointer hover:bg-opacity-40 ${opt.value === value ? 'border border-fuchsia-500' : ''}`}
                        >
                            {opt.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ReusableDropdown;
