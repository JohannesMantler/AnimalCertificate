import React, { useRef, useEffect } from 'react';
import {validNode} from '../../constants';

const PedigreeSpline = ({ splineRefs, componentRef1id, componentRef2id }) => {
    const lineRef = useRef(null);

    const connectDivsWithLine = (exactPos) => {
        if (connectDivsWithLine.timeoutId) {
            clearTimeout(connectDivsWithLine.timeoutId);
        }
    
        if (
            validNode(splineRefs.current[componentRef1id]) &&
            validNode(splineRefs.current[componentRef2id])
        ){
            let div1 = splineRefs.current[componentRef1id];
            let div2 = splineRefs.current[componentRef2id];
            let line = lineRef.current;
    
            let div1Rect = div1.getBoundingClientRect();
            let div2Rect = div2.getBoundingClientRect();
            
            let x1 = div1Rect.left + (div1Rect.width / 2);
            let y1 = div1Rect.top + (div1Rect.height / 2);
            let x2 = div2Rect.left + (div2Rect.width / 2);
            let y2 = div2Rect.top + (div2Rect.height / 2);
    
            if(exactPos !== undefined && exactPos !== null){
                console.log(exactPos.id, div1.id, div2.id)
                if (exactPos.id == div1.id){
                    x1 = exactPos.x + (div1Rect.width / 2);
                    y1 = exactPos.y + (div1Rect.height / 2);
                }
                if (exactPos.id == div2.id){
                    x2 = exactPos.x + (div2Rect.width / 2);
                    y2 = exactPos.y + (div2Rect.height / 2);
                }
            }
    
            
            
            let halfway = (y2-y1)/2;
            
            let path = `M ${x1} ${y1} C ${x1} ${y1+halfway} ${x2} ${y2-halfway} ${x2} ${y2}`;
    
            line.setAttribute('d', path);
        } else {
            connectDivsWithLine.timeoutId = setTimeout(() => {
                connectDivsWithLine();
                connectDivsWithLine.timeoutId = null;
            }, 333);
        }
    };

    const handleDrag = (event) => {
        
        let exactPos = {
            id: event.target.id, // id of dragged element
            x: event.clientX, // x where dragend
            y: event.clientY // y where dragend
        };

        if (handleDrag.timeoutId) {
            clearTimeout(handleDrag.timeoutId);
        }

        handleDrag.timeoutId = setTimeout(() => {
            connectDivsWithLine(exactPos);
            handleDrag.timeoutId = null;
        }, 11);
    };
    
    const handleRollAndScroll = (event) => {
        if (handleRollAndScroll.timeoutId) {
            clearTimeout(handleRollAndScroll.timeoutId);
        }

        handleRollAndScroll.timeoutId = setTimeout(() => {
            connectDivsWithLine();
            handleRollAndScroll.timeoutId = null;
        }, 1);
    };
    
    

    useEffect(() => {
        connectDivsWithLine();
        window.addEventListener("resize", handleRollAndScroll);
        window.addEventListener("scroll", handleRollAndScroll);
        
        if (
            validNode(splineRefs.current[componentRef1id]) &&
            validNode(splineRefs.current[componentRef2id])
        ){
            splineRefs.current[componentRef1id].addEventListener("dragend", handleDrag);
            splineRefs.current[componentRef2id].addEventListener("dragend", handleDrag);
        } else {
            console.warn("Splines do not exist.")
        }

        return () => {
            window.removeEventListener("resize", handleRollAndScroll);
            window.removeEventListener("scroll", handleRollAndScroll);
        };
    }, [componentRef1id, componentRef2id]);

    return (
        <svg className="fixed top-0 left-0 h-screen w-screen -z-10">
            <path ref={lineRef} className="connector absolute border-2 transition-all duration-11 border-black" fill='none' stroke='white'/>
        </svg>
    );
};

export default PedigreeSpline;
