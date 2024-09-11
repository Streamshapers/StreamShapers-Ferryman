import React, {useContext, useEffect, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';
import ConnectApiDialog from "./ConnectApiDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";

function TextsDisplay() {
    const {
        textShowAll,
        setTextShowAll,
        useExternalSources,
        setUseExternalSources,
        textObjects,
        setTextObjects,
        externalSources,
        updateLottieText,
        updateTextRef
    } = useContext(GlobalStateContext);
    const [showOptionMenuIndex, setShowOptionMenuIndex] = useState(null);
    const [isEditingLayerNameIndex, setIsEditingLayerNameIndex] = useState(null);
    const [layerName, setLayerName] = useState("");
    const [colValue, setColValue] = useState('');

    /*useEffect(() => {
        setTexts(texts);
    }, [setTexts, texts]);*/

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.text-option-dropdown')) {
                setShowOptionMenuIndex(null);
            }
            if (!event.target.closest('.layer-name-edit')) {
                setIsEditingLayerNameIndex(null);
            }
        };

        if (showOptionMenuIndex != null || isEditingLayerNameIndex != null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionMenuIndex, isEditingLayerNameIndex]);

    const toggleTextShowAll = () => {
        setTextShowAll(!textShowAll);
    };

    const toggleExternalSources = () => {
        setUseExternalSources(!useExternalSources);
    };

    const handleSelect = (action, textObject) => {
        //console.log("Selected Action:", action);

        if (action === "external" || action === "text") {
            const updatedTextObjects = [...textObjects];
            const index = textObjects.findIndex(t => t === textObject);
            if (index !== -1) {
                if (action === "text") {
                    updatedTextObjects[index].source = "none";
                    updatedTextObjects[index].type = "text";
                } else if (action === "external") {
                    updatedTextObjects[index].source = externalSources[0].index.toString();
                    updatedTextObjects[index].type = externalSources[0].key.toString();
                }
                setTextObjects(updatedTextObjects);
            }
        }

        if (action === "change") {

        }

        setShowOptionMenuIndex(null);
    };

    useEffect(() => {

    }, [textObjects]);

    const handleSourceChange = (index, object) => {
        const source = externalSources.find(obj => obj.index === parseInt(index, 10));
        //console.log("Source", source);
        const type = source.key;
        const updatedTextObjects = [...textObjects];
        const objectIndex = textObjects.findIndex(t => t === object);
        if (objectIndex !== -1) {
            updatedTextObjects[objectIndex].type = type;
            updatedTextObjects[objectIndex].source = index;
            if (type === "Digital Clock") {
                updateLottieText(textObjects.findIndex(t => t === object), source.secret);
            }
            setTextObjects(updatedTextObjects);
        }
        //console.log(textObjects);
    }

    const handleGoogleCoordinates = (object, value) => {
        const updatedTextObjects = [...textObjects];
        const textObject = updatedTextObjects.find(t => t === object);

        if (value) {
            textObject.cell = value.toUpperCase();
        } else {
            console.log("Error saving Google Table coordinates!")
        }
        setTextObjects(updatedTextObjects);
    }

    const setSheetName = (name, object) => {
        const updatedTextObjects = [...textObjects];
        const textObject = updatedTextObjects.find(t => t === object);

        textObject.sheet = name;
        setTextObjects(updatedTextObjects);
    }

    const updateTextObject = (index, newText) => {
        updateLottieText(index, newText);
    }

    const filteredTexts = textObjects.filter((textObject) => {
        return (
            textShowAll ||
            (textObject.layername.startsWith('_') && !textObject.layername.endsWith('_update'))
        );
    });

    const startChangeLayername = (index) => {
        setShowOptionMenuIndex(null);
        setIsEditingLayerNameIndex(index);
    }

    const handleLayerNameChange = (event) => {
        setLayerName(event.target.value);
    };

    const saveLayerName = (object) => {
        const updatedTextObjects = [...textObjects];
        const changeObject = updatedTextObjects.find(t => t === object);
        if (changeObject) {
            changeObject.layername = layerName;
            setIsEditingLayerNameIndex(null);
            setLayerName("");
            setTextObjects(updatedTextObjects);
        }
    };

    return (
        <>
            <div className="controls">
                <div className="control-item">
                    <label htmlFor="textShowAll">Show All</label>
                    <input
                        type="checkbox"
                        title="Show all"
                        id="textShowAll"
                        checked={textShowAll}
                        onChange={toggleTextShowAll}
                    />
                </div>
                <div className="control-item">
                    <label htmlFor="api-dialog-check">External Sources</label>
                    <input
                        type="checkbox"
                        title="Connect API"
                        id="api-dialog-check"
                        checked={useExternalSources}
                        onChange={toggleExternalSources}
                    />
                </div>
            </div>
            <ConnectApiDialog/>
            <div id="text-inputs" className="text-inputs">
                {filteredTexts.map((textObject, i) => {
                    const index = textObjects.indexOf(textObject);
                    const textTitle = "Original: " + textObject.original;
                    let externalSourceSelect;
                    return (
                        <div key={i} className="jsonText">
                            {textObject.errors.length > 0 && (
                                <div className="textFieldErrors">
                                    {textObject.errors.map((error, i) => {
                                        const errorType = typeof error === 'object' ? Object.values(error)[0] : error;
                                        const errorMassage = typeof error === 'object' ? Object.values(error)[1] : error;

                                        return (
                                            <div key={i} className="textError">
                                                <p>
                                                    <b>{errorType}</b> - {errorMassage}</p>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            <div className="textForm">
                                <label className="text-layer-name"
                                       title={textObject.layername}>{textObject.layername}</label>
                                {textObject.type === "text" && (
                                    <input
                                        type="text"
                                        title={textTitle}
                                        data-index={index}
                                        value={textObject.text}
                                        onChange={(e) => updateTextObject(index, e.target.value)}
                                    />
                                )}
                                {textObject.type !== "text" && (
                                    <div className="external-source-form">
                                        <div className="source-select">
                                            <div>Source:</div>
                                            <select value={textObject.source}
                                                    onChange={e => handleSourceChange(e.target.value, textObject)}>
                                                {externalSources.map((api, i) => {
                                                    return (
                                                        <option
                                                            key={i} value={api.index.toString()}>
                                                            {api.index.toString()}
                                                        </option>
                                                    )
                                                })}
                                            </select>
                                        </div>
                                        {textObject.type === "Google Sheet" && (
                                            <>
                                                <label>Cell:
                                                    <input className="google-table-input"
                                                           type="text"

                                                           pattern="[A-Za-z]+[0-9]+"
                                                           onChange={(e) => handleGoogleCoordinates(textObject, e.target.value)}/>
                                                </label>
                                                {/*<label>Row:
                                                <input className="google-table-input"
                                                       type="number"
                                                       onChange={(e) => handleGoogleCoordinates(textObject, "row", e.target.value)}/>
                                            </label>*/}
                                                <label>Sheet (gid):
                                                    <input className=""
                                                           onChange={(e) => setSheetName(e.target.value, textObject)}
                                                           placeholder="leave blank for first sheet..."
                                                    />
                                                </label>
                                            </>
                                        )}
                                    </div>
                                )}

                                {useExternalSources}
                                <div className="option-button-wrapper">
                                    <button className="option-button"
                                            onClick={() => setShowOptionMenuIndex(showOptionMenuIndex === i ? null : i)}>
                                        <FontAwesomeIcon icon={faEllipsisVertical}/>
                                    </button>
                                    {showOptionMenuIndex === i && (
                                        <div className="text-option-dropdown">
                                            <ul>
                                                {textObject.type === "text" && useExternalSources && (
                                                    <li onClick={() => handleSelect("external", textObject)}
                                                        className="text-option-item">Connect External Source
                                                    </li>
                                                )}
                                                {textObject.type !== "text" && useExternalSources && (
                                                    <li onClick={() => handleSelect("text", textObject)}
                                                        className="text-option-item">Connect Text
                                                    </li>
                                                )}
                                                <li onClick={() => startChangeLayername(isEditingLayerNameIndex === i ? null : i)}
                                                    className="text-option-item">Change Layer Name
                                                </li>
                                            </ul>
                                        </div>
                                    )}
                                    {isEditingLayerNameIndex === i && (
                                        <div className="layer-name-edit">
                                            <input
                                                type="text"
                                                value={layerName}
                                                onChange={handleLayerNameChange}
                                                placeholder="Enter new layer name"
                                            />
                                            <button onClick={() => saveLayerName(textObject)}>Save</button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default TextsDisplay;
