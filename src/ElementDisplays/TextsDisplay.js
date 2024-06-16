import React, {useContext, useEffect} from 'react';
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
        showApiDialog,
        setShowApiDialog
    } = useContext(GlobalStateContext);


    useEffect(() => {
        setTexts(texts);
    }, [setTexts, texts]);

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

    const toggleShowApiDialog = () => {
        setShowApiDialog(!showApiDialog);
    };

    const filteredTexts = texts && textsLayerNames && textsLayerNames.filter((textLayerName, i) => {
        return textShowAll || textsLayerNames[i].startsWith('_');
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
                        checked={showApiDialog}
                        onChange={toggleShowApiDialog}
                    />
                </div>
            </div>
            <ConnectApiDialog/>
            <div id="text-inputs" className="text-inputs">
                {/*<div id="text-input-header">
                    <span>Layername</span>
                    <span>Text</span>
                    <span>Original</span>
                </div>*/}
                {filteredTexts.map((textLayerName, i) => {
                    const index = textsLayerNames.indexOf(textLayerName);
                    const textTitle = "Original: " + originalTexts[index];
                    return (
                        <div key={i} className="jsonText">
                            <label className="text-layer-name">{textLayerName}</label>
                            <input
                                type="text"
                                title={textTitle}
                                data-index={index}
                                value={texts[index]}
                                onChange={(e) => updateLottieText(index, e.target.value)}
                            />
                            {/*<span>{originalTexts[index]}</span>*/}
                            <button className="option-button">
                                <FontAwesomeIcon icon={faEllipsisVertical} />
                            </button>
                        </div>
                    );
                })}
            </div>
        </>
    );
}

export default TextsDisplay;
