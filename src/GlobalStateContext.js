import React, {createContext, useEffect, useRef, useState} from 'react';

export const GlobalStateContext = createContext();

export const GlobalStateProvider = ({children}) => {
    const [ferrymanVersion] = useState("v1.6.5");
    const [error, setError] = useState(null);
    const [jsonData, setJsonData] = useState(null);
    const [colors, setColors] = useState([]);
    const [textObjects, setTextObjects] = useState([]);
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
    const [spxExport, setSpxExport] = useState(true);
    const [GDDTemplateDefinition, setGDDTemplateDefinition] = useState({});
    const [useExternalSources, setUseExternalSources] = useState(false);
    const [externalSources, setExternalSources] = useState([{key: 'Google Sheet', secret: '', index: 1}]);
    const [deleteExternalSource, setDeleteExternalSource] = useState(null);
    const [googleTableCells, setGoogleTableCells] = useState([]);
    const [updateGoogle, setUpdateGoogle] = useState(false);
    const [updateExternalSources, setUpdateExternalSources] = useState(0);
    const updateTextRef = useRef(null);
    const [imageEmbed, setImageEmbed] = useState("embed");
    const [exportFormat, setExportFormat] = useState("html");
    const [mimeType, setMimeType] = useState("text/html");
    const [htmlTemplate, setHtmlTemplate] = useState(null);
    const [generalAlerts, setGeneralAlerts] = useState([]);

    const googleCellSnapshot = useRef([]);

    useEffect(() => {
        console.log('%c  StreamShapers Ferryman  ', 'border-radius: 5px; font-size: 1.1em; padding: 10px; background: #4ba1e2; color: #fff; font-family: OpenSans-Regular, arial;');
    }, []);

    useEffect(() => {
        setMarkers(null);
        setCurrentFrame(0);
        setGeneralAlerts([]);
        setUseExternalSources(false);
    }, [jsonFile]);

    //###################################### Errors / Alerts #####################################################################
    const addGeneralAlert = (type, title, message, linkName = "", link = "") => {
        const error = {
            type: type.toString(),
            title: title.toString(),
            message: message.toString(),
            linkName: linkName.toString(),
            link: link.toString()
        };
        setGeneralAlerts(prevAlerts => {
            const filteredAlerts = prevAlerts.filter(alert => alert.title !== error.title);
            return [...filteredAlerts, error];
        });
        //console.log("Added or replaced error:", JSON.stringify(error));
    };


    const removeGeneralAlert = (title) => {
        setGeneralAlerts(prevAlerts => {
            //console.log("Removed alert with title:", title);
            return prevAlerts.filter(alert => alert.title !== title);
        });
    };

    useEffect(() => {
        if (markers) {
            const startExists = markers.some(event => event.cm === 'start');
            const stopExists = markers.some(event => event.cm === 'stop');
            if (!startExists) {
                addGeneralAlert(
                    "error",
                    "Missing start marker",
                    'Your animation has no start marker and might not play correctly. (Start marker needs to be named "start".)',
                    "Here is the documentation",
                    "https://www.streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/prepare-for-ferryman#add-start-and-stop-markers"
                );
            } else {
                removeGeneralAlert("Missing start marker");
            }

            if (!stopExists) {
                addGeneralAlert(
                    "error",
                    "Missing stop marker",
                    'Your animation has no stop marker and might not play correctly. (Stop marker needs to be named "stop".)',
                    "Here is the documentation",
                    "https://www.streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/prepare-for-ferryman#add-start-and-stop-markers"
                );
            } else {
                removeGeneralAlert("Missing stop marker");
            }

            let markerWithoutDuration = [];
            for (let marker of markers) {
                if (marker.dr <= 0) {
                    markerWithoutDuration.push(marker.cm);
                }
            }
            if (markerWithoutDuration.length > 0) {
                const wrongMarkersString = markerWithoutDuration.join(', ');
                addGeneralAlert(
                    "error",
                    "Marker without duration",
                    'Following markers have no duration: ' + wrongMarkersString + '. Markers without an duration can\'t be played.',
                    "Here is the documentation",
                    "https://www.streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/prepare-for-ferryman#add-start-and-stop-markers"
                );
            } else {
                removeGeneralAlert("Marker without duration");
            }
        }
    }, [markers]);

    useEffect(() => {
        if (!markers) {
            addGeneralAlert(
                "error",
                "Markers missing",
                'Your animation does not contain any markers! This could cause it not to play back correctly.',
                "Find out how to add markers",
                "https://streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/prepare-for-ferryman#add-start-and-stop-markers"
            );
        } else {
            removeGeneralAlert("Markers missing")
        }
    }, [jsonData]);

    useEffect(() => {
        let allUploaded = true;
        for (const font of fonts) {
            if (!uploadedFonts.hasOwnProperty(font)) {
                allUploaded = false;
                break;
            }
        }
        if (!allUploaded) {
            addGeneralAlert(
                "error",
                "Font missing",
                'Your animation contains fonts that you haven\'t uploaded. \n This may result in some ' +
                'fonts not being displayed as intended in the animation.\n Please close this dialog and upload' +
                ' all fonts in the fonts Tab.',
            );
        } else {
            removeGeneralAlert("Font missing");
        }
    }, [uploadedFonts, fonts]);

    //Check for embedded Images
    useEffect(() => {
        if (!jsonData) {
            return;
        }
        let missingImages = []
        for (let asset of jsonData.assets) {
            if (asset.p) {
                if (!asset.p.startsWith("data:image") && !asset.id.includes("video")) {
                    missingImages.push(asset.id)
                }
            }
        }
        if (missingImages.length !== 0) {
            addGeneralAlert(
                "alert",
                `Images are missing`,
                'You don\'t have embedded you images in your lottie file. Please check the documentation:  ',
                "See here",
                "https://www.streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/bodymovin/dynamic-templates-export"
            );
        }
    }, [jsonData])

    //check for video Layer
    useEffect(() => {
        if (!jsonData) {
            return;
        }
        let foundVideos = []
        for (let asset of jsonData.assets) {
            if (asset.id.includes("video")) {
                foundVideos.push(asset.id)
            }
        }
        if (foundVideos.length !== 0) {
            addGeneralAlert(
                "Error",
                `Video-Clips are not supported`,
                'Lottiefiles does not support videos, neither Ferryman does. Try to use image-sequenzes instead.',
                "See here",
                "https://streamshapers.com/docs/documentation/streamshapers-ferryman/aftereffects-for-html/supported-features#image-sequences"
            );
        }

    }, [jsonData])

    //################################# Infos ######################################################################
    useEffect(() => {
        if (!jsonData) {
            return;
        }

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

                if (path) {
                    // Für normale Schriftarten, die nicht mit "data:font" beginnen
                    if (!newFonts.includes(fontName) && !path.startsWith("data:font") || !newFonts.includes(fontName) && path.startsWith("data:font/unn")) {
                        newFonts.push(fontName);
                    }

                    // Für eingebettete Schriftarten, die mit "data:font" beginnen
                    if (path.startsWith("data:font") && !path.startsWith("data:font/unn")) {
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

        const oldStyleTags = document.querySelectorAll('style.fontFacesTags');
        oldStyleTags.forEach(tag => tag.remove());


        fontFaces.forEach(face => {
            const styleElement = document.createElement('style');
            styleElement.setAttribute('type', 'text/css');
            styleElement.classList.add('fontFacesTags');
            styleElement.innerHTML = face.toString();
            document.head.appendChild(styleElement);
        });
    }, [fontFaces]);

    //######################################## Texts ###############################################################

    useEffect(() => {
        function searchForTexts(obj) {
            let tempTextObjects = [];

            if (typeof obj === "object" && obj !== null) {
                if (obj.t && obj.t.d && obj.t.d.k && Array.isArray(obj.t.d.k) && obj.t.d.k.length > 0 && obj.t.d.k[0].s && obj.t.d.k[0].s.t) {
                    tempTextObjects = [...tempTextObjects, {
                        layername: obj.nm,
                        text: obj.t.d.k[0].s.t,
                        original: obj.t.d.k[0].s.t,
                        type: 'text',
                        source: 'none',
                        sheet: "0",
                        cell: "",
                        errors: [],
                    }];
                }

                Object.keys(obj).forEach(key => {
                    const childResults = searchForTexts(obj[key]);
                    tempTextObjects.push(...childResults.textObjects);
                });
            }

            return {textObjects: tempTextObjects};
        }

        if (jsonData) {
            const {textObjects} = searchForTexts(jsonData);
            setTextObjects(textObjects);
            //console.log(textObjects);
        }

    }, [jsonData]);

    const setTextError = (obj, err) => {
        const updatedTexts = [...textObjects];
        const textObject = updatedTexts.find(t => t === obj);

        if (textObject) {
            if (!Array.isArray(textObject.errors)) {
                textObject.errors = [];
            }

            const errorExists = textObject.errors.some(e => e.type === err.type);

            if (!errorExists) {
                textObject.errors.push(err);
            } else {
                console.warn(`Error with type "${err.type}" already exists`);
            }

            //console.log("Text Errors", textObject.errors);
        } else {
            console.warn("textObject is undefined");
        }

        setTextObjects(updatedTexts);
    };


    const removeTextError = (obj, errType) => {
        const updatedTexts = [...textObjects];
        const textObject = updatedTexts.find(t => t === obj);

        if (textObject && Array.isArray(textObject.errors)) {
            textObject.errors = textObject.errors.filter(e => e.type !== errType);

            //console.log("Remaining Text Errors", textObject.errors);
        } else {
            console.warn("textObject or textObject.errors is undefined");
        }

        setTextObjects(updatedTexts);
    };


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

        if (textObjects) {
            searchAndUpdateText(tempJsonData);
        }

        setJsonData(tempJsonData);

        const updatedTextObjects = [...textObjects];
        updatedTextObjects[index].text = newText;
        setTextObjects(updatedTextObjects);
    };

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
                if (obj.hasOwnProperty('nm') && obj.hasOwnProperty('refId') && !obj.nm.startsWith('_imagesequence')) {
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
        const steps = markers ? markers.length - 1 : 0;
        const rawSpxJson = {
            "description": "",
            "playserver": "OVERLAY",
            "playchannel": "1",
            "playlayer": "5",
            "webplayout": "5",
            "out": "manual",
            "dataformat": "json",
            "uicolor": "0",
            "steps": `${steps}`,
            "DataFields": []
        };
        let spxExportJson = {...rawSpxJson};

        if (fileName) {
            spxExportJson.description = fileName;
        }

        let textsWithNames = {};

        if (textObjects) {
            for (let i = 0; i < textObjects.length; i++) {
                if (textObjects[i].layername.startsWith('_') && textObjects[i].type === "text" && !(textObjects[i].layername.includes("_update"))) {
                    textsWithNames[textObjects[i].layername] = textObjects[i].text;
                }
            }
        }

        if (Object.keys(textsWithNames).length > 0) {
            Object.keys(textsWithNames).forEach((key, index) => {
                spxExportJson.DataFields.push({
                    "field": key,
                    "ftype": "textfield",
                    "title": key,
                    "value": textsWithNames[key]
                });
            });
        }


        if (refImages) {
            refImages.forEach(refImage => {
                if (refImage.nm.startsWith("_")) {
                    spxExportJson.DataFields.push({
                        "field": refImage.nm,
                        "ftype": "filelist",
                        "title": "Choose Image",
                        "assetfolder": `/media/images/`,
                        "extension": "png",
                        "value": `/media/images/${refImage.refId}.png`
                    });
                }
            });
        }
        //console.log(spxExportJson);
        setSPXGCTemplateDefinition(spxExportJson);
    }, [fileName, textObjects, jsonData, refImages, markers]);

    //############################################ GDD ################################################################

    useEffect(() => {
        const rawGddJson = {
            "$schema": "https://superflytv.github.io/GraphicsDataDefinition/gdd-meta-schema/v1/schema.json",
            "title": "",
            "description": "",
            "authorName": "",
            "authorEmail": "",
            "type": "object",
            "properties": {},
            "required": [],
            "gddPlayoutOptions": {}
        };

        let gddExportJson = {...rawGddJson};

        if (fileName) {
            gddExportJson.title = fileName;
        }

        let textsWithNames = {};
        if (textObjects) {
            for (let i = 0; i < textObjects.length; i++) {
                if (textObjects[i].layername.startsWith('_') && textObjects[i].type === "text") {
                    textsWithNames[textObjects[i].layername] = textObjects[i].text;
                }
            }
        }

        if (Object.keys(textsWithNames).length > 0) {
            Object.keys(textsWithNames).forEach((key, index) => {
                gddExportJson.properties[key] = {
                    "type": "string",
                    "gddType": "single-line",
                    "default": textsWithNames[key],
                    "maxLength": 50,
                    "minLength": 1,
                    "pattern": "[\\s\\S]+",
                    "gddOptions": {}
                };
            });
        }

        if (refImages) {
            refImages.forEach(refImage => {
                gddExportJson.properties[refImage.nm] = {
                    "type": "string",
                    "gddType": "file-path/image-path",
                    "gddOptions": {
                        "extensions": ["jpg", "png"]
                    },
                    "default": `/media/images/${refImage.refId}.png`
                };
            });
        }
        //console.log(gddExportJson);
        setGDDTemplateDefinition(gddExportJson);
    }, [fileName, textObjects, jsonData, refImages, markers]);

    //############################################ External Sources ################################################################

    useEffect(() => {
        if (!useExternalSources) {
            const updatedTextObjects = textObjects.map(textObject => {
                if (textObject.type !== "text") {
                    if (textObject.type === "Digital Clock") {
                        textObject.text = textObject.original;
                    }
                    return {...textObject, type: "text"};
                }
                return textObject;
            })
            setTextObjects(updatedTextObjects);
        }
    }, [useExternalSources]);

    useEffect(() => {
        //console.log("Delete:", deleteExternalSource);
        if (deleteExternalSource) {
            const updatedTextObjects = [...textObjects];
            for (let i = 0; i < textObjects.length; i++) {
                if (updatedTextObjects[i].source === deleteExternalSource.toString()) {
                    updatedTextObjects[i].source = "";
                    updatedTextObjects[i].type = "text";
                    updatedTextObjects[i].text = updatedTextObjects[i].original;
                }
            }
            setTextObjects(updatedTextObjects);

        }
    }, [deleteExternalSource]);

    useEffect(() => {
        const updatedGoogleTableCells = [];
        textObjects.map(textObject => {
            if (textObject.type === 'Google Sheet' && externalSources.length > 0) {
                const index = textObject.source;
                const source = externalSources.find(obj => obj.index === parseInt(index, 10));
                //textObject.text = textObject.oiginal;
                updatedGoogleTableCells.push({
                    id: source.secret,
                    key: textObject.layername,
                    cell: textObject.cell,
                    sheet: textObject.sheet,
                    value: textObject.text
                })
            }
        })
        //console.log(updatedGoogleTableCells);
        const currentSnapshotString = JSON.stringify(googleCellSnapshot.current);
        const updatedCellsString = JSON.stringify(updatedGoogleTableCells);

        if (currentSnapshotString !== updatedCellsString) {
            //console.log("Zellen haben sich geändert");
            googleCellSnapshot.current = [...updatedGoogleTableCells];
            setGoogleTableCells(updatedGoogleTableCells);
            setUpdateGoogle(true);
        } else {
            //console.log("Keine Änderung in den Zellen");
        }

    }, [textObjects, externalSources]);

    function arraysAreEqual(arr1, arr2) {
        // Check if both arrays are null or undefined
        if (!arr1 && !arr2) return true;
        // Check if one of them is null or undefined
        if (!arr1 || !arr2) return false;
        // Compare lengths
        if (arr1.length !== arr2.length) return false;
        // Compare elements
        for (let i = 0; i < arr1.length; i++) {
            if (arr1[i] !== arr2[i]) return false;
        }
        return true;
    }


    useEffect(() => {
        if (textObjects && textObjects.length > 0) {
            const updatedTextObjects = [...textObjects];

            updatedTextObjects.map(textObject => {
                const source = externalSources.find(obj => obj.index === parseInt(textObject.source, 10));
                if (source) {
                    textObject.type = source.key;
                }
                if (textObject.type === "Digital Clock") {
                    textObject.text = source.secret;
                    updateLottieText(textObjects.findIndex(t => t === textObject), textObject.text);
                }
                if (textObject.type === "Google Sheet") {
                    textObject.text = textObject.oiginal;
                }
            })

            setTextObjects(updatedTextObjects);
        }
    }, [externalSources, updateExternalSources]);

    async function fetchDataFromGoogle(url) {
        try {
            let response = await fetch(url);

            if (!response.ok) {
                //console.warn(`Fehler beim Abrufen der Daten. Status: ${response.status}`);
                return null;
            }

            let csvText = await response.text();
            //console.log("CSVRaw", csvText);
            return csvText.split('\n').map(row => row.split(','));
        } catch (error) {
            console.warn("Error collecting data from Google:", error);
            return null;
        }
    }

    function getCellData(key, cell, data) {
        const obj = textObjects.find(obj => obj.layername === key);

        try {
            const columnName = cell.match(/[A-Z]+/g)[0];
            const base = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
            let rowIx = (parseInt(cell.match(/[0-9]+/g)[0])) - 1; // Row index (0-based)
            let colIx = 0;

            for (let i = 0; i < columnName.length; i++) {
                colIx = colIx * 26 + base.indexOf(columnName[i]) + 1;
            }
            colIx = colIx - 1; // Column index (0-based)

            let cellValue = data[rowIx] ? data[rowIx][colIx] : undefined;

            if (cellValue && cellValue.startsWith('"') && cellValue.endsWith('"')) {
                cellValue = cellValue.slice(1, -1);
            }

            if (cellValue) {
                cellValue = cellValue.replace(/\r/g, '').replace(/\n/g, '');
            }

            //console.log("CellValue = ", cellValue);
            if (obj) {
                removeTextError(obj, "Cell Error");
            }
            return cellValue;

        } catch (error) {
            //console.log("Error getCellData from GoogleSheet:", error); HIER FEHLERMELDUNG
            if (obj) {
                setTextError(obj, {
                    type: "Cell Error",
                    text: "The cell value is not valid, must be in format [A-Za-z]+[0-9]+!"
                });
            }
        }
    }

    const updateGoogleData = async () => {
        let sources = {};
        for (let i = 0; i < googleTableCells.length; i++) {
            const object = googleTableCells[i];
            //console.log("Layer: ", object.key);

            if (object.id && object.sheet && object.cell) {
                const cell = object.cell;
                const sheetURL = `https://docs.google.com/spreadsheets/d/${object.id}/export?format=csv&gid=${object.sheet}`;

                let csvArray;
                if (!sources[sheetURL]) {
                    csvArray = await fetchDataFromGoogle(sheetURL);
                    sources[sheetURL] = csvArray;
                    //console.log("Sources updated:", sources);
                } else {
                    csvArray = sources[sheetURL];
                    //console.log("Sheet URL already exists in sources. Using cached value:", csvArray);
                }

                if (csvArray && csvArray.length > 0) {
                    const value = getCellData(object.key, cell, csvArray);
                    if (value !== undefined && value !== object.value) {
                        //console.log(`Extracted value for ${cell}: ${value}`);
                        let copiedJsonData = {...jsonData};
                        for (const layer of copiedJsonData.layers) {
                            if (layer.nm === object.key) {
                                const textObject = textObjects.find(obj => obj.layername === object.key);
                                const textIndex = textObjects.findIndex(t => t === textObject);
                                updateLottieText(textIndex, value.toString());
                            }
                        }
                        object.value = value;

                        //setJsonData(copiedJsonData);
                    }
                }
            }
        }
    }

    useEffect(() => {
        if (updateGoogle) {
            updateGoogleData().then(() => setUpdateGoogle(false));
        }
    }, [googleTableCells, updateGoogle]);


    /*useEffect(() => {
        if(updateMarkerReady){
            const textObjectIndex = textObjects.findIndex(obj => obj.layername === updateTextValue.layername);
            setUpdateTextValue(null);
            console.log("inde: " + textObjectIndex + "value: " + updateTextValue.text);
            updateLottie(textObjectIndex, updateTextValue.text);
        }
    }, [updateMarkerReady]);*/

    /*############################# generate Template ########################################*/

    const generateFile = async (production) => {
        let fileContent;
        let lottieScriptUrl = 'https://cdn.jsdelivr.net/npm/lottie-web/build/player/lottie.min.js';
        let lottiePlayerCode = '';
        let correctPath;
        let jsonWithoutImages = "";
        let playerCode;

        if (production) {
            playerCode = "</head>";
        } else {
            playerCode = `<script>
                    window.addEventListener('message', (event) => {
                        //console.log('Received message:', event.data);

                        const message = event.data;

                        if (!message) {
                            console.log('No message received.');
                            return;
                        }
                        
                        switch (message.action) {
                            case 'update':
                                if(message.data){
                                    update(message.data);
                                } else {
                                    update();
                                }
                                break;
                            case 'play':
                                play();
                                break;
                            case 'next':
                                next();
                                break;
                            case 'stop':
                                stop();
                                break;
                            default:
                                console.log('Unknown action:', message.action);
                        }
                    });

                    function update(jsonData) {
                        if (jsonData) {
                            console.log('Update action triggered with data:', jsonData);
                        } else {
                            console.log('Update action triggered without data.');
                        }
                    }

                    function play() {
                        console.log('Play action triggered');
                        addEvents(animation); 
                    }

                    function next() {
                        console.log('Next action triggered');
                    }

                    function stop() {
                        console.log('Stop action triggered');
                    }
                </script></head>`;
        }

        if (imagePath != null && !imagePath.endsWith("/")) {
            setImagePath(`${imagePath}/`);
            correctPath = `${imagePath}/`;
        } else {
            correctPath = imagePath;
        }

        try {
            const response = await fetch(lottieScriptUrl);
            if (!response.ok) throw new Error('CDN not answering');
            lottiePlayerCode = await response.text();
        } catch (error) {
            console.error('Error loading Lottie Player from CDN, use local image:', error);
            const localScriptResponse = await fetch('/lottie/lottie.min.js');
            if (!localScriptResponse.ok) {
                console.error('Error loading local Lottie image:', localScriptResponse.statusText);
                return;
            }
            lottiePlayerCode = await localScriptResponse.text();
        }

        if (jsonData && jsonData.assets) {
            if (imagePath != null && !imagePath.endsWith("/")) {
                setImagePath(`${imagePath}/`);
            }
            jsonWithoutImages = JSON.parse(JSON.stringify(jsonData));

            jsonWithoutImages.assets.forEach(asset => {
                if (asset.p && asset.p.startsWith('data:image')) {
                    asset.p = asset.id + ".png";
                    asset.e = 0;
                    asset.u = imagePath;
                }
            });
        }

        switch (exportFormat) {
            case 'html':
                setMimeType('text/html');
                try {
                    let response = null;
                    response = await fetch('/template/raw-template.html');

                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const template = await response.text();

                    let fontFacesString = '';
                    for (const font in fontFaces) {
                        fontFacesString += fontFaces[font];
                    }

                    let jsonDataString
                    if (imageEmbed === "embed") {
                        jsonDataString = JSON.stringify(jsonData);
                    } else if (imageEmbed === "extra") {
                        jsonDataString = JSON.stringify(jsonWithoutImages);
                    }
                    const path = `"${correctPath}"`
                    let spxTag = " ";
                    if (spxExport) {
                        spxTag = "<script type=\"text/javascript\">window.SPXGCTemplateDefinition = " + JSON.stringify(SPXGCTemplateDefinition) + ";</script>";
                    }

                    fileContent = template
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${jsonData}', jsonDataString)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${version}', ferrymanVersion)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${fontFaceStyles}', "<style>" + fontFacesString + "</style>")
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${lottieData}', lottiePlayerCode)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${imagePath}', path)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${spx}', spxTag)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${googleTableData}', JSON.stringify(googleTableCells))
                        .replace('</head>', playerCode);

                } catch (error) {
                    console.error('Error loading the template:', error);
                    return;
                }
                break;
            case 'json':
                setMimeType('application/json');
                if (imageEmbed === "embed") {
                    fileContent = JSON.stringify(jsonData);
                } else if (imageEmbed === "extra") {
                    fileContent = JSON.stringify(jsonWithoutImages);
                }
                break;
            default:
                console.warn('unknown exportformat:', exportFormat);
                return;
        }

        setHtmlTemplate(fileContent);
        return fileContent;
    };

    useEffect(() => {
        async function generateHTML() {
            setExportFormat("html");
            await generateFile();
        }

        generateHTML().then();
    }, [jsonData]);

    return (
        <GlobalStateContext.Provider value={{
            ferrymanVersion,
            jsonData,
            setJsonData,
            colors,
            setColors,
            error,
            setError,
            images,
            setImages,
            infos,
            setInfos,
            fonts,
            setFonts,
            uploadedFonts,
            setUploadedFonts,
            fontFaces,
            setFontFaces,
            textShowAll,
            setTextShowAll,
            markers,
            setMarkers,
            currentFrame,
            setCurrentFrame,
            isPlaying,
            setIsPlaying,
            fileName,
            setFileName,
            jsonFile,
            setJsonFile,
            theme,
            setTheme,
            refImages,
            imagePath,
            setImagePath,
            SPXGCTemplateDefinition,
            setSPXGCTemplateDefinition,
            spxExport,
            setSpxExport,
            GDDTemplateDefinition,
            setGDDTemplateDefinition,
            useExternalSources,
            setUseExternalSources,
            externalSources,
            setExternalSources,
            textObjects,
            setTextObjects,
            deleteExternalSource,
            setDeleteExternalSource,
            googleTableCells,
            setGoogleTableCells,
            updateGoogle,
            setUpdateGoogle,
            updateLottieText,
            updateTextRef,
            imageEmbed,
            setImageEmbed,
            exportFormat,
            setExportFormat,
            mimeType,
            setMimeType,
            generateFile,
            htmlTemplate,
            setHtmlTemplate,
            generalAlerts,
            setGeneralAlerts,
            updateExternalSources,
            setUpdateExternalSources
        }}>
            {children}
        </GlobalStateContext.Provider>
    );
}