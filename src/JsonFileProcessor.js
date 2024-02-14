import React, {useContext, useState} from 'react';
import {GlobalStateContext} from "./GlobalStateContext";
import jsonElementsDisplay from "./JsonElementsDisplay";

function JsonFileProcessor() {
    const {
        jsonData, setJsonData, colors, setColors, error, setError,
        texts, setTexts, textsLayerNames, setTextsLayerNames, images, setImages,
        savedFrame, setSavedFrame, isPlaying, setIsPlaying, currentFrame, setCurrentFrame
    } = useContext(GlobalStateContext);

    const resetState = () => {
        setJsonData(null);
        setColors([]);
        setTexts([]);
        setTextsLayerNames([]);
        setImages([]);
        setSavedFrame(0);
        setIsPlaying(true);
        setCurrentFrame(0);
    };

    const processJsonFile = (file) => {
        if (!file) {
            setError("Select a file please.");
            return;
        }
        if (file.type !== 'application/json') {
            setError("Please select a valid JSON file.");
            return;
        }

        const reader = new FileReader();
        reader.readAsText(file, "UTF-8");
        reader.onload = (event) => {
            handleFileLoad(event.target.result);
        };
        reader.onerror = () => setError("Error reading the file.");
    };

    const handleFileLoad = (content) => {
        if (typeof content !== 'string') {
            setError("Error reading the file: Content is not a string.");
            return;
        }

        try {
            resetState();
            const jsonData = JSON.parse(content);
            setJsonData(jsonData);
        } catch (error) {
            setError(`Error reading the JSON file. Please make sure it is a valid JSON file. Error: ${error.message}`);
        }
    };


    return (
        <div>
            <input type="file" id="jsonFile" accept=".json" onChange={(e) => processJsonFile(e.target.files[0])} />
            {error && <div className="error-message">{error}</div>}
            {/* Weitere UI-Elemente und Logik hier */}
        </div>
    );

}
export default JsonFileProcessor;
