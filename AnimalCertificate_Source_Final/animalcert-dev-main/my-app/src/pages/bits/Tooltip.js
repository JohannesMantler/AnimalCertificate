import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setCountdown } from '../../redux/slices/tooltipSlice';

const Tooltip = () => {
    const dispatch = useDispatch();
    const { countdown, color, text, link } = useSelector(state => state.tooltip);
    const [isHovering, setIsHovering] = useState(false);
    const [initialCountdown, setInitialCountdown] = useState(0);
    
    useEffect(() => {
        let timer;
        if (countdown > 0) {
            if(initialCountdown === 0){
                setInitialCountdown(countdown)
            }
            
            timer = setTimeout(() => {
                if(!isHovering) {
                    dispatch(setCountdown(countdown-25));
                }
            }, 25);
        } else if (countdown <= 0) {
            setInitialCountdown(0)
        }
        return () => clearTimeout(timer);
    }, [countdown, isHovering]);

    const progressBarWidth = initialCountdown > 0 ? `${(countdown / initialCountdown) * 100}%` : '0%';

    return (
        <div className={`
            fixed top-16 
            w-64 h-16 z-30
            
            font-sans
            
            transition-all
            ${countdown <= 0 ? '-right-72' : 'right-6'}
            
            bg-gradient-to-br
            ${color === 'red' ? 'from-red-500 to-red-400' : ''}
            ${color === 'green' ? 'from-green-500 to-green-400' : ''}
            ${color === 'gray' ? 'from-slate-700 to-slate-600' : ''}
            
            rounded
            border-solid border-2
            ${color === 'red' ? 'border-red-500' : ''}
            ${color === 'green' ? 'border-green-400' : ''}
            ${color === 'gray' ? 'border-slate-700' : ''}
        `}
        
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}>
        
            <div className="
                absolute
                top-1 right-4
                
                text-white text-opacity-75
            ">
                {Math.round(countdown / 1000)}
            </div>
            
            <div className="
                py-2 px-4
                flex gap-1 flex-col
                w-full
                text-sm
            ">
                <p className='
                    
                '>{text}</p>
                <a 
                className='
                    underline
                '
                href={link}>{link}</a>
            </div>
            
            <div 
                className="
                absolute
                bottom-0 left-0 right-0
                
                h-1 w-full bg-blue-500" 
                style={{ width: progressBarWidth }}
            ></div>
        </div>
    );
};

export default Tooltip;
