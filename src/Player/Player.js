import React, {useContext, useState} from "react";
import LottiePreview from "./LottiePreview";
import LottieDemo from "./LottieDemo";
import {GlobalStateContext} from "../GlobalStateContext";

function Player() {
    const {setIsPlaying, setCurrentFrame} = useContext(GlobalStateContext);
    const [activeTab, setActiveTab] = useState('standard');
    const [key, setKey] = useState(0);

    const handleTabChange = tabName => {
        setCurrentFrame(0);
        setIsPlaying(false);
        setKey(prevKey => prevKey + 1);
        setActiveTab(tabName);
    };

    return (
        <div id="previewWrapper">
            <div className="player-mode">
                <button className={`player-mode-button ${activeTab === 'standard' ? 'active' : ''}`}
                        onClick={() => handleTabChange('standard')}>Analyze
                </button>
                <button className={`player-mode-button ${activeTab === 'demo' ? 'active' : ''}`}
                        onClick={() => handleTabChange('demo')}>Demo Player
                </button>
            </div>
            {activeTab === 'standard' && (
                <LottiePreview key={`standard-${key}`}/>
            )}
            {activeTab === 'demo' && (
                <LottieDemo key={`demo-${key}`}/>
            )}
        </div>
    )
}

export default Player;