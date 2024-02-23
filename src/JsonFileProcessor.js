import React, {useContext, useEffect} from 'react';
import {GlobalStateContext} from "./GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFile, faFileArrowUp, faFileExport} from "@fortawesome/free-solid-svg-icons";

function JsonFileProcessor() {
    const {
        jsonData,
        setJsonData,
        setColors,
        setError,
        setTexts,
        setTextsLayerNames,
        setImages,
        setMarkers,
        setCurrentFrame,
        setIsPlaying,
        setFileName,
        jsonFile,
        setJsonFile
    } = useContext(GlobalStateContext);

    const resetState = () => {
        setJsonData(null);
        setColors([]);
        setTexts([]);
        setTextsLayerNames([]);
        setImages([]);
        setCurrentFrame(0);
        setIsPlaying(true);
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

        setFileName(file.name.replace(/\.json$/, ''));

        setJsonFile(file);
    };

    useEffect(() => {
        if (jsonFile) {
            const reader = new FileReader();
            reader.readAsText(jsonFile, "UTF-8");
            reader.onload = (event) => {
                handleFileLoad(event.target.result);
            };
            reader.onerror = () => setError("Error reading the file.");
        }
    }, [jsonFile]);

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

    const resetJsonFile = () => {
        setJsonFile(null);
        setJsonData(null);
    }

    return (
        <div>
            {/*<input type="file" id="jsonFile" accept=".json" onChange={(e) => processJsonFile(e.target.files[0])}/>
            {error && <div className="error-message">{error}</div>}*/}
            <div id="loadArea" className="headerButton" onClick={resetJsonFile}>
                <span>New </span>
                <FontAwesomeIcon icon={faFileArrowUp} title="Export"/>
            </div>
        </div>
    );
}

export default JsonFileProcessor;
