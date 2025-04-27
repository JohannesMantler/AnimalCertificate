import React from 'react';

const Background = () => {
    const circles = [];

    for (let i = 0; i < 5; i++) {
        const radius = Math.random() * 150 + 100; // Random radius between 10 and 60
        const x = Math.random() * 90;
        const y = Math.random() * 90;

        const circleStyle = {
            top: y+"%",
            left: x+"%",
            width: radius,
            height: radius,
        };

        circles.push(
            <div 
                key={i} 
                className="absolute rounded-full milky-glass drop-shadow-xl" 
                style={circleStyle}    
            ></div>
        );
    }



    return <div className="fixed top-0 left-0 w-full h-full -z-20">{circles}</div>;
};

export default Background;
