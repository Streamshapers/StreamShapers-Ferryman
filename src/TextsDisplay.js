import React, {useContext, useEffect, useState} from 'react';
import {GlobalStateContext} from './GlobalStateContext';

function TextsDisplay() {
    const { jsonData, texts, originalTexts, textsLayerNames, setJsonData } = useContext(GlobalStateContext);
    const [textShowAll, setTextShowAll] = useState(false);

    const updateLottieText = (index, newText) => {
        if (!jsonData) {
            console.error("No valid Lottie or Data.");
            return;
        }

        const tempJsonData = jsonData;
        let currentTextIndex = 0; // Global counter for each text element found

        // Recursive function to search and update the specific text in the Lottie JSON
        function searchAndUpdateText(obj) {
            if (typeof obj === "object" && obj !== null) {
                if (obj.t && obj.t.d && obj.t.d.k) {
                    obj.t.d.k.forEach((item) => {
                        // Update the text only if the current index matches the provided textIndex
                        if (item.s && currentTextIndex === index) {
                            console.log("Updating text at index:", currentTextIndex);
                            item.s.t = newText;
                        }
                        currentTextIndex++; // Increment the counter for each text element
                    });
                }

                // Continue the search in all properties of the object
                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        searchAndUpdateText(obj[key]);
                    }
                }
            }
        }

        if(texts) {
            searchAndUpdateText(tempJsonData);
        }
        setJsonData(tempJsonData);
    };

    const toggleTextShowAll = () => {
        setTextShowAll(!textShowAll);
    };

    return (
        <div>
            <div id="textControls">
                <div className="textControl">
                    <label htmlFor="textShowAll">Show All</label>
                    <input
                        type="checkbox"
                        title="Show all"
                        id="textShowAll"
                        checked={textShowAll}
                        onChange={toggleTextShowAll}
                    />
                </div>
            </div>
            <div id="text-inputs" className="text-inputs">
                {texts && textsLayerNames && texts.map((text, i) => {
                        return (
                            <div key={i} className="jsonText">
                                <label>{textsLayerNames[i]}:</label>
                                <input
                                    type="text"
                                    data-index={i}
                                    value={text}
                                    onChange={(e) => updateLottieText(i, e.target.value)}
                                />
                                <span>{originalTexts[i]}</span>
                            </div>
                        );
                })}
            </div>
        </div>
    );
}

export default TextsDisplay;
