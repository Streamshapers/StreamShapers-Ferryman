import React from 'react';
import './App.css';

function WindowTooNarrowWarning() {
    return (
        <div className="warning">
            <a href="https://www.streamshapers.com/"><img id="to-narrow-img" src="./logo-light.png" alt="logo"/></a>
            <p>Your window is too narrow. Please use a larger screen to access the Converter.</p>
            <p>In the meantime, visit our <a href="https://discord.gg/ksNhRkzrM6">Discord</a> or check out our <a
                href="https://www.streamshapers.com/docs/intro">Tutorials</a>.</p>
        </div>
    );
}

export default WindowTooNarrowWarning;
