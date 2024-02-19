import React, {createContext, useEffect, useState} from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({children}) => {
    const [error, setError] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [colors, setColors] = useState([]);
    const [texts, setTexts] = useState([]);
    const [originalTexts, setOriginalTexts] = useState([]);
    const [textsLayerNames, setTextsLayerNames] = useState([]);
    const [images, setImages] = useState([]);
    const [infos, setInfos] = useState({});
    const [fonts, setFonts] = useState([]);
    const [uploadedFonts, setUploadedFonts] = useState({});
    const [fontFaces, setFontFaces] = useState(null);
    const [textShowAll, setTextShowAll] = useState(false);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        if (!jsonData) {
            return;
        }

        //################################# Infos ######################################################################
        const newInfos = {};

        if (jsonData.op && jsonData.fr) {
            newInfos.duration = jsonData.op / jsonData.fr;
        }

        const jsonSizeInBytes = new TextEncoder().encode(JSON.stringify(jsonData)).length;
        newInfos.animationSize = (jsonSizeInBytes / 1024).toFixed(2) + " kb";

        if (jsonData.fr) {
            newInfos.frameRate = jsonData.fr;
        }

        if (jsonData.w && jsonData.h) {
            newInfos.resolution = `${jsonData.w}x${jsonData.h}`;
        }

        if (jsonData.v) {
            newInfos.lottieVersion = jsonData.v;
        }

        if (jsonData.layers) {
            newInfos.numLayers = jsonData.layers.length;
        }

        if (jsonData.op !== undefined) {
            newInfos.looping = jsonData.op === 1 ? 'Yes' : 'No';
        }

        if (jsonData.meta && jsonData.meta.creator) {
            newInfos.author = jsonData.meta.creator;
        }

        if (jsonData.meta && jsonData.meta.description) {
            newInfos.description = jsonData.meta.description;
        }

        setInfos(newInfos);

    }, [jsonData]);

    //############################## Fonts #########################################################################
    useEffect(() => {
        const newFonts = [];
        if (jsonData && jsonData.fonts && jsonData.fonts.list) {
            jsonData.fonts.list.forEach(font => {
                const fontName = font.fFamily;
                if (!newFonts.includes(fontName)) {
                    newFonts.push(fontName);
                }
            });
        }

        setFonts(newFonts);

    }, [jsonData]);

    useEffect(() => {
        let styles = '';
        for (const fontName in uploadedFonts) {
            if (uploadedFonts.hasOwnProperty(fontName)) {
                const fontBase64 = uploadedFonts[fontName];
                styles += `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontBase64}');
                }
                
            `;
            }
        }
        setFontFaces(styles);
    }, [uploadedFonts]);

    useEffect(() => {
        if (!fontFaces) {
            return;
        }
        const styleElement = document.createElement('style');
        styleElement.setAttribute('type', 'text/css');
        styleElement.innerHTML = fontFaces.toString();
        document.head.appendChild(styleElement);

        return () => {
            document.head.removeChild(styleElement);
        };
    }, [fontFaces]);

    //######################################## Texts ###############################################################

    useEffect(() => {
        function searchForTexts(obj) {
            let tempTexts = [];
            let tempOriginalTexts = [];
            let tempTextsLayerNames = [];

            if (typeof obj === "object") {
                if (obj && obj.t && obj.t.d && obj.t.d.k && obj.t.d.k.length > 0) {
                    tempTexts.push(obj.t.d.k[0].s.t);
                    tempOriginalTexts.push(obj.t.d.k[0].s.t);
                    tempTextsLayerNames.push(obj.nm);
                }

                for (const key in obj) {
                    if (obj.hasOwnProperty(key)) {
                        const childResults = searchForTexts(obj[key]);
                        if (childResults) {
                            tempTexts.push(...childResults.texts);
                            tempOriginalTexts.push(...childResults.originalTexts);
                            tempTextsLayerNames.push(...childResults.textsLayerNames);
                        }
                    }
                }
            }

            return {
                texts: tempTexts,
                originalTexts: tempOriginalTexts,
                textsLayerNames: tempTextsLayerNames
            };
        }

        if (jsonData) {
            const {texts, originalTexts, textsLayerNames} = searchForTexts(jsonData);
            setTexts(texts);
            setOriginalTexts(originalTexts);
            setTextsLayerNames(textsLayerNames);
        }

    }, [jsonData]);

    //############################### Colors ###########################################################################

    useEffect(() => {
        function isValidColor(colorString) {
            return /^([0-9a-fA-F]{6})$/.test(colorString);
        }

        function getColorStringFromObject(colorObj) {
            return colorObj
                .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
                .slice(0, 3)
                .join("");
        }

        function searchForColors(obj, depth = 0) {
            let tempColors = [];
            let tempColorsLayerName = [];
            const maxDepth = 10;

            if (depth > maxDepth) {
                return tempColors;
            }

            if (typeof obj === "object") {
                const colorProperties = ["fc", "sc", "fill", "stroke", "tr", "s", "b", "k"];
                colorProperties.forEach((prop) => {
                    if (obj && obj[prop] && Array.isArray(obj[prop])) {
                        const colorString = obj[prop]
                            .map((c) => Math.round(c * 255).toString(16).padStart(2, "0"))
                            .slice(0, 3)
                            .join("");
                        if (isValidColor(colorString) && !tempColors.some((color) => color.join("") === colorString)) {
                            tempColors.push(obj[prop]);
                            tempColorsLayerName.push(obj.nm);
                        }
                    }
                });

                if (obj && obj.g && obj.g.p && obj.g.k) {
                    const gradientColors = obj.g.k;
                    for (let i = 0; i < gradientColors.length; i++) {
                        const color = gradientColors[i];
                        if (typeof color === 'object' && color.p && color.k) {
                            // Found gradient color, recursively find colors
                            const gradientColors = color.k;
                            for (let i = 0; i < gradientColors.length; i++) {
                                const gradientColor = gradientColors[i];
                                const colorString = getColorStringFromObject(gradientColor);
                                if (isValidColor(colorString) && !tempColors.some((existingColor) => existingColor.join("") === colorString)) {
                                    tempColors.push(gradientColor);
                                }
                            }
                        } else {
                            // Found regular color
                            const colorString = getColorStringFromObject(color);
                            if (isValidColor(colorString) && !tempColors.some((existingColor) => existingColor.join("") === colorString)) {
                                tempColors.push(color);
                            }
                        }
                    }
                }

                for (const key in obj) {
                    if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
                        const childColors = searchForColors(obj[key], depth + 1);
                        tempColors = tempColors.concat(childColors);
                    }
                }
            }

            return {
                tempColors
            };
        }

        if (jsonData) {
            const {colors} = searchForColors(jsonData);
            setColors(colors);
        }
    }, [jsonData]);

    //########################################## Images ################################################################

    useEffect(() => {
        function searchForImages(obj) {
            let tempImages = [];
            const imageProperties = ["u", "p"];

            if (typeof obj === "object") {
                imageProperties.forEach((prop) => {
                    if (obj[prop] && typeof obj[prop] === "string" && obj[prop].startsWith("data:image")) {
                        tempImages.push(obj[prop]);
                    }
                });

                for (const key in obj) {
                    if (obj.hasOwnProperty(key) && typeof obj[key] === "object") {
                        tempImages = tempImages.concat(searchForImages(obj[key]));
                    }
                }
            }

            return tempImages;
        }

        if (jsonData) {
            const extractedImages = searchForImages(jsonData);
            setImages(extractedImages);
        }
    }, [jsonData]);

    return (
        <GlobalStateContext.Provider value={{
            jsonData, setJsonData, colors, setColors, error, setError, texts, setTexts, textsLayerNames,
            setTextsLayerNames, images, setImages, infos, setInfos, fonts, setFonts,
            uploadedFonts, setUploadedFonts, originalTexts, setOriginalTexts, fontFaces, setFontFaces,
            textShowAll, setTextShowAll, markers, setMarkers
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
}