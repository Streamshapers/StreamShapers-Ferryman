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
    const [fontFaces, setFontFaces] = useState([]);
    const [textShowAll, setTextShowAll] = useState(false);
    const [markers, setMarkers] = useState([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [isPlaying, setIsPlaying] = useState(true);
    const [fileName, setFileName] = useState(null);
    const [jsonFile, setJsonFile] = useState(null);
    const [theme, setTheme] = useState('dark');
    const [refImages, setRefImages] = useState([]);
    const [imagePath, setImagePath] = useState("images/");
    const [SPXGCTemplateDefinition, setSPXGCTemplateDefinition] = useState({});

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
                let fontName = font.fFamily;
                const path = font.fPath;
                const addUploadetFont = (name, data) => {
                    setUploadedFonts(prevFonts => {
                        // Prüfen, ob der Schriftname bereits in prevFonts existiert, um Duplikate zu vermeiden
                        if (!prevFonts[name]) {
                            return {
                                ...prevFonts,
                                [name]: data
                            };
                        }
                        return prevFonts; // Keine Änderung, wenn der Name bereits existiert
                    });
                };

                // Für normale Schriftarten, die nicht mit "data:font" beginnen
                if (!newFonts.includes(fontName) && !path.startsWith("data:font")) {
                    newFonts.push(fontName);
                }

                // Für eingebettete Schriftarten, die mit "data:font" beginnen
                if (path.startsWith("data:font")) {
                    if (!font.fFamily.endsWith(font.fStyle)) {
                        fontName = font.fFamily + " " + font.fStyle;
                    }
                    font.fFamily = fontName;

                    // Überprüfen, ob die Schriftart bereits zu newFonts hinzugefügt wurde, um Doppelungen zu vermeiden
                    if (!newFonts.includes(fontName)) {
                        newFonts.push(fontName);
                        addUploadetFont(fontName, path);
                    }
                }
            });
        }

        setFonts(newFonts);
    }, [jsonData, setUploadedFonts]);


    useEffect(() => {
        let styles = '';
        let newFontFaces = [];
        for (const fontName in uploadedFonts) {
            if (uploadedFonts.hasOwnProperty(fontName)) {
                const fontBase64 = uploadedFonts[fontName];
                styles = `
                @font-face {
                    font-family: '${fontName}';
                    src: url('${fontBase64}');
                }
            `;
                newFontFaces.push(styles);
            }
        }
        setFontFaces(newFontFaces);
    }, [uploadedFonts]);

    useEffect(() => {
        if (!fontFaces) {
            return;
        }
        for (const face in fontFaces) {
            const styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            styleElement.innerHTML = fontFaces[face].toString();
            document.head.appendChild(styleElement);
        }
    }, [fontFaces]);

    //######################################## Texts ###############################################################

    useEffect(() => {
        function searchForTexts(obj) {
            let tempTexts = [];
            let tempOriginalTexts = [];
            let tempTextsLayerNames = [];

            if (typeof obj === "object" && obj !== null) {
                if (obj.t && obj.t.d && obj.t.d.k && Array.isArray(obj.t.d.k) && obj.t.d.k.length > 0 && obj.t.d.k[0].s && obj.t.d.k[0].s.t) {
                    tempTexts.push(obj.t.d.k[0].s.t);
                    tempOriginalTexts.push(obj.t.d.k[0].s.t);
                    tempTextsLayerNames.push(obj.nm);
                }

                Object.keys(obj).forEach(key => {
                    const childResults = searchForTexts(obj[key]);
                    tempTexts.push(...childResults.texts);
                    tempOriginalTexts.push(...childResults.originalTexts);
                    tempTextsLayerNames.push(...childResults.textsLayerNames);
                });
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
            const maxDepth = 10;

            if (depth > maxDepth) {
                return [];
            }

            if (typeof obj === "object") {
                const colorProperties = ["fc", "sc", "fill", "stroke", "tr", "s", "b", "k"];
                colorProperties.forEach((prop) => {
                    if (obj && obj[prop] && Array.isArray(obj[prop])) {
                        const colorString = getColorStringFromObject(obj[prop]);
                        if (isValidColor(colorString) && !tempColors.includes(colorString)) {
                            tempColors.push(colorString);
                        }
                    }
                });

                if (obj && obj.g && obj.g.p && obj.g.k) {
                    const gradientColors = obj.g.k;
                    for (let i = 0; i < gradientColors.length; i++) {
                        const color = gradientColors[i];
                        if (typeof color === 'object' && color.p && color.k) {
                            const gradientColors = color.k;
                            for (let i = 0; i < gradientColors.length; i++) {
                                const gradientColor = gradientColors[i];
                                const colorString = getColorStringFromObject(gradientColor);
                                if (isValidColor(colorString) && !tempColors.includes(colorString)) {
                                    tempColors.push(colorString);
                                }
                            }
                        } else {
                            const colorString = getColorStringFromObject(color);
                            if (isValidColor(colorString) && !tempColors.includes(colorString)) {
                                tempColors.push(colorString);
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

            return tempColors;
        }

        if (jsonData) {
            const colors = searchForColors(jsonData);
            setColors(colors);
        }
    }, [jsonData]);


    //########################################## Images ################################################################

    useEffect(() => {
        function searchForObjectsWithRefId(obj) {
            let tempList = [];

            if (typeof obj === "object" && obj !== null) {
                // Prüfen, ob das Objekt die Eigenschaften 'nm' und 'refId' hat
                if (obj.hasOwnProperty('nm') && obj.hasOwnProperty('refId')) {
                    tempList.push(obj);
                }

                // Durch alle Schlüssel des Objekts iterieren und rekursiv suchen
                Object.keys(obj).forEach(key => {
                    if (typeof obj[key] === 'object') {
                        const childResults = searchForObjectsWithRefId(obj[key]);
                        tempList = tempList.concat(childResults);
                    }
                });
            }

            return tempList;
        }
        if (jsonData) {
            const imageNames = searchForObjectsWithRefId(jsonData);
            setRefImages(imageNames);
        }
    }, [jsonData]);

    useEffect(() => {
        function searchForImages(obj) {
            let tempImages = [];
            const imageProperties = ["u", "p"];

            if (typeof obj === "object" && obj !== null) {
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

    //############################################ SPX ############################################################

    useEffect(() => {
        const rawSpxJson = {
            "description": "",
            "playserver": "OVERLAY",
            "playchannel": "1",
            "playlayer": "5",
            "webplayout": "5",
            "out": "manual",
            "dataformat": "json",
            "uicolor": "7",
            "DataFields": []
        };
        let spxExportJson = {...rawSpxJson};

        if(fileName){
            spxExportJson.description = fileName;
        }

        let textsWithNames = {};

        if(texts && textsLayerNames){
            for (let i = 0; i < texts.length; i++){
                if(textsLayerNames[i] && textsLayerNames[i].startsWith('_')) {
                    textsWithNames[textsLayerNames[i]] = texts[i];
                }
            }
            console.log(textsWithNames);
        }

        if (Object.keys(textsWithNames).length > 0) {
            spxExportJson.DataFields = Object.keys(textsWithNames).map((key, index) => ({
                "field": `f${index + 1}`,
                "ftype": "textfield",
                "title": key,
                "value": textsWithNames[key]
            }));
            console.log(spxExportJson);
        }

        setSPXGCTemplateDefinition(spxExportJson);
    }, [fileName, texts, textsLayerNames]);

    return (
        <GlobalStateContext.Provider value={{
            jsonData, setJsonData, colors, setColors, error, setError, texts, setTexts, textsLayerNames,
            setTextsLayerNames, images, setImages, infos, setInfos, fonts, setFonts, uploadedFonts, setUploadedFonts,
            originalTexts, setOriginalTexts, fontFaces, setFontFaces, textShowAll, setTextShowAll, markers,
            setMarkers, currentFrame, setCurrentFrame, isPlaying, setIsPlaying, fileName, setFileName, jsonFile,
            setJsonFile, theme, setTheme, refImages, imagePath, setImagePath, SPXGCTemplateDefinition,
            setSPXGCTemplateDefinition
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
}