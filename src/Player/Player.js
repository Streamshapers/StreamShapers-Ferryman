import React, {useContext, useEffect, useState} from "react";
import AnalyzePlayer from "./AnalyzePlayer";
import {GlobalStateContext} from "../Context/GlobalStateContext";
import TemplatePlayer from "./PreviewPlayer";

function Player() {
    const {jsonData, setIsPlaying, setCurrentFrame, fileName, markers} = useContext(GlobalStateContext);
    const [activeTab, setActiveTab] = useState('standard');
    const [key, setKey] = useState(0);

    const handleTabChange = tabName => {
        setCurrentFrame(0);
        setIsPlaying(false);
        setKey(prevKey => prevKey + 1);
        setActiveTab(tabName);
    };

    useEffect(() => {
        if(jsonData) {
            setActiveTab("standard");
        } else{
            setActiveTab("template");
        }
    }, [fileName]);

    return (
        <div id="previewWrapper">
            {markers && markers.length > 0 && (
                <div className="mode-switch">
                    {jsonData && (
                    <button className={`mode-button ${activeTab === 'standard' ? 'active' : ''}`}
                            onClick={() => handleTabChange('standard')}
                            title="check your animation frame by frame"
                    >Analyze
                    </button>
                    )}
                    <button className={`mode-button ${activeTab === 'template' ? 'active' : ''}`}
                            onClick={() => handleTabChange('template')}
                            title="preview your HTML-Template">Preview
                    </button>
                </div>
            )}
            {activeTab === 'standard' && (
                <AnalyzePlayer key={`standard-${key}`}/>
            )}
            {activeTab === 'template' && (
                <TemplatePlayer key={`template-${key}`}/>
            )}
        </div>
    )
}

export default Player;
