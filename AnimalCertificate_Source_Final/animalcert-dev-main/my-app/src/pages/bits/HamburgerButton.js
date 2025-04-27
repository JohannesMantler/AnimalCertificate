import React, { useState, useEffect } from 'react';

const HamburgerButton = ({className, onClick, active}) => {
    const [isOpen, setIsOpen] = useState(!active);
    const genericHamburgerLine = `h-1 w-6 rounded-full bg-white transition ease transform duration-300`;
    
    useEffect(() => {
        setIsOpen(!active)
    }, [active]);

    return (
        <button
            className={`
                ${className}
                grid grid-cols-1 grid-rows-[auto auto auto] gap-1 group 
                
                py-2 px-8 rounded-lg 
                self-center 
                select-none cursor-pointer 
                transition-all duration-300
                hover:shadow-sm hover:backdrop-blur-sm hover:bg-white/20
            `}
            onClick={() => {
                setIsOpen(!isOpen);
                onClick();
            }}
        >
            <div
                className={`${genericHamburgerLine} ${isOpen
                        ? "rotate-45 translate-y-2 opacity-50 group-hover:opacity-100"
                        : "opacity-50 group-hover:opacity-100"
                    }`}
            />
            <div
                className={`${genericHamburgerLine} ${isOpen ? "opacity-0" : "opacity-50 group-hover:opacity-100"
                    }`}
            />
            <div
                className={`${genericHamburgerLine} ${isOpen
                        ? "-rotate-45 -translate-y-2 opacity-50 group-hover:opacity-100"
                        : "opacity-50 group-hover:opacity-100"
                    }`}
            />
        </button>
    );
};

export default HamburgerButton;