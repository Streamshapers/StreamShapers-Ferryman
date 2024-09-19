import React, {useContext} from 'react';
import {GlobalStateContext} from '../Context/GlobalStateContext';

function ColorsDisplay() {
    const {jsonData, setJsonData, colors} = useContext(GlobalStateContext);

    function updateLottieColor(colorIndex, newColor) {
        const hexColor = parseInt(newColor.slice(1), 16);
        const newColorArray = [
            ((hexColor >> 16) & 255) / 255,
            ((hexColor >> 8) & 255) / 255,
            (hexColor & 255) / 255,
            1,
        ];

        function searchAndUpdateColor(obj) {
            if (!obj || typeof obj !== "object") {
                return;
            }

            const colorProperties = ["fc", "sc", "fill", "stroke", "tr", "s", "b", "k"];
            colorProperties.forEach((prop) => {
                if (obj[prop] && Array.isArray(obj[prop])) {
                    const currentColorHex = obj[prop]
                        .slice(0, 3)
                        .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
                        .join("");
                    if (colors[colorIndex] === currentColorHex) {
                        obj[prop] = newColorArray;
                        colors[colorIndex] = newColor.slice(1);
                    }
                }
            });

            Object.keys(obj).forEach((key) => {
                if (typeof obj[key] === "object" && obj[key] !== null) {
                    searchAndUpdateColor(obj[key]);
                }
            });
        }

        if (jsonData) {
            searchAndUpdateColor(jsonData);
            setJsonData({...jsonData});
        }
    }

    return (
        <div className="color-pickers">
            {colors.map((hexColor, index) => (
                <div className="colorPicker" key={index}>
                    <label>{index + 1}:</label>
                    <input
                        type="color"
                        data-index={index}
                        value={`#${hexColor}`}
                        onChange={(e) => updateLottieColor(index, e.target.value)}
                    />
                    <span>{"#" + hexColor}</span>
                </div>
            ))}
        </div>
    );
}

export default ColorsDisplay;
