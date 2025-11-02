import React, { useState, useEffect } from 'react';
import { useRef } from 'react';


const RadialMenu = ({ title, name, options }) => {
    let radial = useRef(null);
    let circleWrapper = useRef(null);
    let center = useRef(null);


    let mountCount = 0;

    useEffect(() => {
        if (mountCount <= 0) {
            mountCount++;
            initializeRadialMenu();
        }
    }, []);

    const [selectedOption, setSelectedOption] = useState('');

    function initializeRadialMenu() {

        setInitialPosition();

        toggleMenu();
    };

    function setInitialPosition() {
        if(circleWrapper.current != null){
            let smallCircles = circleWrapper.current.querySelectorAll('.radial-circle');
    
            let smallCircleCount = smallCircles.length;
            for (let i = 0; i < smallCircleCount; i++) {
                let angle =
                    (2 * Math.PI * i) / smallCircleCount +
                    Math.PI / smallCircleCount -
                    Math.PI / 2;
    
                const x = 50 + Math.cos(angle) * 52;
                const y = 50 + Math.sin(angle) * 52;
    
                let circleRect = smallCircles[i].getBoundingClientRect();
    
                smallCircles[i].style.top = `calc(${y}% - ${circleRect.width / 2}px)`;
                smallCircles[i].style.left = `calc(${x}% - ${circleRect.width / 2}px)`;
            }
        }
    };

    function handleOptionClick(selectedOptionText) {
        console.log("click");
        setSelectedOption(selectedOptionText);
        toggleMenu();
    };

    function toggleMenu() {
        
        if(circleWrapper.current != null)
            circleWrapper.current.classList.toggle('hidden');
    };

    return (
        <div className="radial-menu-container">
            <div className="radial-label">{title}</div>
            <div ref={radial} id={'radial-' + title} className="radial-wrapper">
                <div ref={center} className="radial-center" onClick={toggleMenu}>
                    {selectedOption}
                </div>
                <div ref={circleWrapper} className="radial-circle-wrapper">
                    {options.map((option, index) => (
                        <label key={index} className="radial-circle" >
                            <input type="radio" name={name} hidden value={option} onClick={() => {handleOptionClick( option )}} />
                            {option}
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default RadialMenu;
