import React, { useState } from 'react';

const PedigreeDots = React.forwardRef((props, ref) => {

    const [isClicked, setIsClicked] = useState(false);

    const handleClick = () => {
        setIsClicked(!isClicked);
    };

    return (
        <div
            ref={ref}
            className={`circle${isClicked ? ' clicked' : ''}`}
            onClick={handleClick}
        >
            <svg>
                <circle cx="50%" cy="50%" r="90" stroke="white" strokeWidth="4" fill="transparent" />
                <circle className="dot dot1" cx="50%" cy="50%" r="5" fill="black" />
                <circle className="dot dot2" cx="50%" cy="50%" r="5" fill="black" />
                <circle className="dot dot3" cx="50%" cy="50%" r="5" fill="black" />
            </svg>
        </div>
    );
});

export default PedigreeDots;
