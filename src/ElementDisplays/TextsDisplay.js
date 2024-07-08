import React, {useContext, useEffect, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';
import ConnectApiDialog from "./ConnectApiDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";

function TextsDisplay() {
    const {
        jsonData,
        texts,
        setTexts,
        originalTexts,
        textsLayerNames,
        setJsonData,
        textShowAll,
        setTextShowAll,
        useExternalSources,
        setUseExternalSources,
        textObjects,
        setTextObjects,
        externalSources,
        setExternalSources
    } = useContext(GlobalStateContext);
    const [showOptionMenuIndex, setShowOptionMenuIndex] = useState(null);
    const [colValue, setColValue] = useState('');

    useEffect(() => {
        setTexts(texts);
    }, [setTexts, texts]);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (!event.target.closest('.text-option-dropdown')) {
                setShowOptionMenuIndex(null);
            }
        };

        if (showOptionMenuIndex != null) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showOptionMenuIndex]);

    const updateLottieText = (index, newText) => {
        if (!jsonData) {
            console.error("No valid Lottie or Data.");
            return;
        }

        const tempJsonData = jsonData;
        let currentTextIndex = 0;

        function searchAndUpdateText(obj) {
            if (typeof obj === "object" && obj !== null) {
                if (obj.t && obj.t.d && obj.t.d.k) {
                    obj.t.d.k.forEach((item) => {
                        if (item.s && currentTextIndex === index) {
                            //console.log("Updating text at index:", currentTextIndex);
                            item.s.t = newText;
                        }
                        currentTextIndex++;
                    });
                }

                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        searchAndUpdateText(obj[key]);
                    }
                }
            }
        }

        if (texts) {
            searchAndUpdateText(tempJsonData);
        }

        setJsonData(tempJsonData);

        const updatedTexts = [...texts];
        updatedTexts[index] = newText;
        setTexts(updatedTexts);
    };

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

    const handleSourceChange = (index, object) => {
        const source = externalSources.find(obj => obj.index === parseInt(index, 10));
        //console.log("Source", source);
        const type = source.key;
        const updatedTextObjects = [...textObjects];
        const objectIndex = textObjects.findIndex(t => t === object);
        if (objectIndex !== -1) {
            updatedTextObjects[objectIndex].type = type;
            updatedTextObjects[objectIndex].source = index;
            setTextObjects(updatedTextObjects);
        }
        //console.log(textObjects);
    }

    const handleGoogleCoordinates = (object, type, value) => {
        const updatedTextObjects = [...textObjects];
        const textObject = updatedTextObjects.find(t => t === object);
        if (type === "col" && /^[a-zA-Z]*$/.test(value)) {
            setColValue(value);
            textObject.col = value;
        } else if (type === "row") {
            textObject.row = value;
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

    /*const filteredTexts = texts && textsLayerNames && textsLayerNames.filter((textLayerName, i) => {
        return textShowAll || textsLayerNames[i].startsWith('_');
    });*/

    const filteredTexts = textObjects.filter((textObject) => {
        return textShowAll || textObject.layername.startsWith('_');
    });


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
                            <label className="text-layer-name">{textObject.layername}</label>
                            {textObject.type === "text" && (
                                <input
                                    type="text"
                                    title={textTitle}
                                    data-index={index}
                                    value={texts[index]}
                                    onChange={(e) => updateLottieText(index, e.target.value)}
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
                                    {textObject.type === "Google Table" && (
                                        <>
                                            <label>Column:
                                                <input className="google-table-input"
                                                       type="text"

                                                       pattern="[a-zA-Z]*"
                                                       onChange={(e) => handleGoogleCoordinates(textObject, "col", e.target.value)}/>
                                            </label>
                                            <label>Row:
                                                <input className="google-table-input"
                                                       type="number"
                                                       onChange={(e) => handleGoogleCoordinates(textObject, "row", e.target.value)}/>
                                            </label>
                                            <label>Sheet:
                                                <input className="google-table-input"
                                                       onChange={(e) => setSheetName(e.target.value, textObject)}/>
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
                                            <li onClick={() => handleSelect("change", textObject)}
                                                className="text-option-item">Change Layer Name
                                            </li>
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default TextsDisplay;
