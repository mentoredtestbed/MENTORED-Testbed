import React, { useState, useEffect} from 'react';

import '../../assets/css/ProgressBar.css';

interface Props {
    width: string;
    showButton: boolean;
    height: string;
    showPercentage: boolean;
    initialProgress: number;
    reloadTime: number;
}


const ProgressBar: React.FC<Props> = ({ width, height, showButton, showPercentage, initialProgress, reloadTime}) => {

    const [progress, setProgress] = useState(initialProgress);
    const [isRunning, SetIsRunning] = useState(false);
    const [updateTime, SetUpdateTime] = useState(reloadTime);

    const handleButtonProgress = () => {
        SetIsRunning(true);
    }

    const handleButtonReset = () => {
        SetIsRunning(false);
        setProgress(0);
    }

    const defaultUpdate = (prev, cb) => {
        if(prev < 100){
            cb(prev + 1);
        }
    }

    const getColor = (p) => {
        if(p < 25){
            return "#ff0000";
        }else if(p < 50){
            return "#D2691E";
        }else if(p < 70){
            return "#ffa500";
        }else if(p < 100){
            return "#1E90FF";
        }else{
            return "#2ecc71";
        }
    }

    useEffect(() => {
        if(!showButton) {
            SetIsRunning(true);
        }
        
        if(progress < 100 && isRunning && updateTime > 0){
            setTimeout(() => defaultUpdate(progress, setProgress), updateTime);
        }

    }, [initialProgress, progress, isRunning])
    

    return (
        <div className="container" style={{ width: `${width}`}}>
            <div className="progress-bar" style={{ height: `${height}`}}>
                <div className="progress-bar-fill" style={{ width: `${initialProgress}%`, backgroundColor: getColor(initialProgress) }}>
                </div>
                {showPercentage && (<span className='progress-percent'>{ initialProgress }%</span>)}
            </div>
            {showButton && (
                <div className="progress-button">
                    <button onClick={handleButtonProgress}>Run</button>
                    <button onClick={handleButtonReset}>Reset</button>
                </div>
            )}
        </div>
    );
}

export default ProgressBar;