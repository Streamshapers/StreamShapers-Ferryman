import React, {useState} from "react";
import LottiePreview from "./LottiePreview";
import LottieDemo from "./LottieDemo";

function Player() {
    const [activeTab, setActiveTab] = useState('standard');

    const handleTabChange = tabName => {
        setActiveTab(tabName);
    };

    return (
        <>
            <div className="tab-navigation">
                <button className={`tab-button ${activeTab === 'standard' ? 'active' : ''}`}
                        onClick={() => handleTabChange('standard')}>Analyze
                </button>
                <button className={`tab-button ${activeTab === 'demo' ? 'active' : ''}`}
                        onClick={() => handleTabChange('demo')}>Demo Player
                </button>
            </div>
            {activeTab === 'standard' && (
                <LottiePreview/>
            )}
            {activeTab === 'demo' && (
                <LottieDemo/>
            )}
        </>
    )
}

export default Player;