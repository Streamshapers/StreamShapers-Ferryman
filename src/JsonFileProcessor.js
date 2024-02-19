import React, {useContext, useState} from 'react';
import {GlobalStateContext} from "./GlobalStateContext";
import jsonElementsDisplay from "./JsonElementsDisplay";

function JsonFileProcessor() {
    const {
        setJsonData, setColors, error, setError, setTexts, setTextsLayerNames, setImages, setMarkers
    } = useContext(GlobalStateContext);

    const resetState = () => {
        setJsonData(null);
        setColors([]);
        setTexts([]);
        setTextsLayerNames([]);
        setImages([]);
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
            setMarkers(jsonData.markers);
        } catch (error) {
            setError(`Error reading the JSON file. Please make sure it is a valid JSON file. Error: ${error.message}`);
        }
    };


    return (
        <div>
            <input type="file" id="jsonFile" accept=".json" onChange={(e) => processJsonFile(e.target.files[0])}/>
            {error && <div className="error-message">{error}</div>}
            {/* Weitere UI-Elemente und Logik hier */}
        </div>
    );

}

export default JsonFileProcessor;
