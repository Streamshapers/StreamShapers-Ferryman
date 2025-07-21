import React, {useContext, useEffect} from 'react';
import {GlobalStateContext} from "./Context/GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileArrowUp} from "@fortawesome/free-solid-svg-icons";
import {Link} from "react-router-dom";

function JsonFileProcessor() {
    const {
        setJsonData,
        setColors,
        setError,
        setTextObjects,
        setImages,
        setMarkers,
        setCurrentFrame,
        setIsPlaying,
        setFileName,
        jsonFile,
        setJsonFile,
        importFerrymanJSON,
        setImportFerrymanJSON,
        setUseExternalSources,
        setExternalSources,
        setGeneralAlerts,
        setSPXGCTemplateDefinition,
        setTemplateData,
        setGoogleTableCells,
        setUpdateExternalSources,
        setUpdateGoogle,
        clocks,
        setFetchSourcesPeriodically,
        sourcesFetchInterval,
        setSourcesFetchInterval
    } = useContext(GlobalStateContext);

    const resetState = () => {
        setJsonData(null);
        setColors([]);
        setTextObjects([]);
        setImages([]);
        setCurrentFrame(0);
        setIsPlaying(true);
        setMarkers(null);
        setGeneralAlerts([]);
        setUseExternalSources(false);
        setExternalSources([{key: 'Google Sheet', secret: '', index: 1, errors: ''}]);
        setSPXGCTemplateDefinition({});
        setTemplateData(null);
        setGoogleTableCells(null);
        setUpdateExternalSources(0);
        setUpdateGoogle(false);
        clocks.current = {};
        setFetchSourcesPeriodically(false);
        setFileName(null);
        setJsonFile(null);
        setSourcesFetchInterval(5000);
        setImportFerrymanJSON(null);
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
            const jsonData = JSON.parse(content);
            setJsonData(jsonData);
            if (jsonData.markers && jsonData.markers.length > 0) {
                setMarkers(jsonData.markers);
            }
            if (importFerrymanJSON) {
                if (importFerrymanJSON.textObjects) setTextObjects(importFerrymanJSON.textObjects);
                if (importFerrymanJSON.useExternalSources) setUseExternalSources(importFerrymanJSON.useExternalSources);
                if (importFerrymanJSON.externalSources) setExternalSources(importFerrymanJSON.externalSources);
                if (importFerrymanJSON.fetchSourcesPeriodically) setFetchSourcesPeriodically(importFerrymanJSON.fetchSourcesPeriodically);
                if (importFerrymanJSON.sourcesFetchInterval) setSourcesFetchInterval(importFerrymanJSON.sourcesFetchInterval);
                if (importFerrymanJSON.clocks) clocks.current = importFerrymanJSON.clocks;
            }
        } catch (error) {
            setError(`Error reading the JSON file. Please make sure it is a valid JSON file. Error: ${error.message}`);
        }
    };

    const resetJsonFile = () => {
        setJsonFile(null);
        setJsonData(null);
        resetState();

        if (window && window.history && window.location) {
            const { protocol, host, pathname, hash } = window.location;
            const newUrl = `${protocol}//${host}${pathname}${hash}`;
            window.history.replaceState({}, '', newUrl);
        }
    }


    return (
        <>
            {/*<input type="file" id="jsonFile" accept=".json" onChange={(e) => processJsonFile(e.target.files[0])}/>
            {error && <div className="error-message">{error}</div>}*/}
            <Link to="/">
                <div id="loadArea" className="headerButton headerButton1" onClick={resetJsonFile}>
                    <span>New </span>
                    <FontAwesomeIcon icon={faFileArrowUp} title="New File"/>
                </div>
            </Link>
        </>
    );
}

export default JsonFileProcessor;
