import React, {useContext, useEffect, useState} from "react";
import LottiePreview from "./LottiePreview";
import LottieDemo from "./LottieDemo";
import {GlobalStateContext} from "../GlobalStateContext";
import TemplatePlayer from "./TemplatePlayer";

function Player() {
    const {setIsPlaying, setCurrentFrame, fileName, markers} = useContext(GlobalStateContext);
    const [activeTab, setActiveTab] = useState('standard');
    const [key, setKey] = useState(0);

    const handleTabChange = tabName => {
        setCurrentFrame(0);
        setIsPlaying(false);
        setKey(prevKey => prevKey + 1);
        setActiveTab(tabName);
    };

    useEffect(() => {
        setActiveTab("standard");
    }, [fileName]);

    return (
        <div id="previewWrapper">
            {markers && markers.length > 0 && (
                <div className="player-mode">
                    <button className={`player-mode-button ${activeTab === 'standard' ? 'active' : ''}`}
                            onClick={() => handleTabChange('standard')}>Analyze
                    </button>
                    <button className={`player-mode-button ${activeTab === 'demo' ? 'active' : ''}`}
                            onClick={() => handleTabChange('demo')}
                            title="Play your Template just like in CasparCG">Demo Player
                    </button>
                    <button className={`player-mode-button ${activeTab === 'template' ? 'active' : ''}`}
                            onClick={() => handleTabChange('template')}
                            title="Play your Template just like in CasparCG">Template Player
                    </button>
                </div>
            )}
            {activeTab === 'standard' && (
                <LottiePreview key={`standard-${key}`}/>
            )}
            {activeTab === 'demo' && (
                <LottieDemo key={`demo-${key}`}/>
            )}
            {activeTab === 'template' && (
                <TemplatePlayer key={`template-${key}`}/>
            )}
        </div>
    )
}

export default Player;