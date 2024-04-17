import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "./GlobalStateContext";

function ExportDialog({isOpen, onClose}) {
    const {
        jsonData,
        fileName,
        setFileName,
        setIsPlaying,
        fontFaces,
        uploadedFonts,
        fonts,
        imagePath,
        setImagePath
    } = useContext(GlobalStateContext);
    const [exportFormat, setExportFormat] = useState("html");
    const [allFontsLoaded, setAllFontsLoaded] = useState(false);

    if (isOpen) {
        setIsPlaying(false);
    }

    useEffect(() => {
        let allUploaded = true;
        for (const font of fonts) {
            if (!uploadedFonts.hasOwnProperty(font)) {
                allUploaded = false;
                break;
            }
        }
        setAllFontsLoaded(allUploaded);
    }, [uploadedFonts, fonts]);


    const RadioButton = ({label, value, onChange}) => {
        return (
            <label className="exportRadioButton">
                <input type="radio" checked={value} onChange={onChange}/>
                {label}
            </label>
        );
    };

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    const downloadFile = async () => {
        let fileContent;
        let mimeType;
        let extension;
        let lottieScriptUrl = 'https://cdn.jsdelivr.net/npm/lottie-web/build/player/lottie.min.js';
        let lottiePlayerCode = '';
        let correctPath;

        if(imagePath != null && !imagePath.endsWith("/")){
            setImagePath(`${imagePath}/`);
            correctPath = `${imagePath}/`;
        } else{
            correctPath = imagePath;
        }

        try {
            const response = await fetch(lottieScriptUrl);
            if (!response.ok) throw new Error('CDN nicht erreichbar');
            lottiePlayerCode = await response.text();
        } catch (error) {
            console.error('Fehler beim Laden des LottiePlayer-Codes vom CDN, verwende lokale Kopie:', error);
            const localScriptResponse = await fetch('/lottie/lottie.min.js');
            if (!localScriptResponse.ok) {
                console.error('Fehler beim Laden der lokalen LottiePlayer-Kopie:', localScriptResponse.statusText);
                return;
            }
            lottiePlayerCode = await localScriptResponse.text();
        }
        console.log(lottiePlayerCode)

        switch (exportFormat) {
            case 'html':
                mimeType = 'text/html';
                extension = '.html';
                try {
                    const response = await fetch('/template/raw-template.html');
                    if (!response.ok) {
                        throw new Error(`HTTP error! status: ${response.status}`);
                    }
                    const template = await response.text();

                    let fontFacesString = '';
                    for (const font in fontFaces) {
                        fontFacesString += fontFaces[font];
                    }

                    let jsonDataString = JSON.stringify(jsonData);
                    const path = `"${correctPath}"`

                    fileContent = template
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${jsonData}', jsonDataString)
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${fontFaceStyles}', "<style>" + fontFacesString + "</style>")
                        // eslint-disable-next-line no-template-curly-in-string
                        .replace('${lottieData}', lottiePlayerCode)

                        .replace('${imagePath}', path);

                } catch (error) {
                    console.error('Error loading the template:', error);
                    return;
                }
                break;
            case 'json':
                mimeType = 'application/json';
                extension = '.json';
                fileContent = JSON.stringify(jsonData);
                break;
            default:
                console.warn('Unbekanntes Exportformat:', exportFormat);
                return;
        }

        const blob = new Blob([fileContent], {type: mimeType});
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = fileName + extension;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    const handleExportFormat = (format) => () => {
        setExportFormat(format);
    };
    const handleFileNameChange = (e) => {
        setFileName(e.target.value);
        console.log(fileName)
    };

    if (!isOpen) return null;

    return (<>
            <div className="overlay"></div>
            <div id="exportDialogWindow">
                <h2>Export</h2>
                {!allFontsLoaded && <div id="font-alert-wrapper">
                    <div id="font-alert">
                        The animation contains fonts that you haven't uploaded.
                    </div>
                    <div id="font-alert">
                        This may result in some fonts not being displayed as intended in the animation.
                    </div>
                    <div id="font-alert">
                        Please close this dialog and upload all fonts in the fonts Tab.
                    </div>
                </div>}
                <div id="exportFileName">
                    <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                    <input type="text" id="fileNameInput" value={String(fileName)} onChange={handleFileNameChange}/>
                    <span id="fileType">.{exportFormat}</span>
                </div>
                <div id="exportOptions">
                    <div id="export-format">
                        <RadioButton value={exportFormat === 'html'} label="CasparCG HTML-Template"
                                     onChange={handleExportFormat("html")}/>
                        <RadioButton value={exportFormat === 'json'} label="JSON"
                                     onChange={handleExportFormat('json')}/>
                        {/* <option value="separate">Separate HTML und JSON (Zip)</option> */}
                    </div>
                </div>
                <div className="popupButtonArea">
                    <button id="downloadBtn" onClick={onClose}>Close</button>
                    <button id="downloadBtn" onClick={downloadFile}>Download File</button>
                </div>
            </div>
        </>
    )
        ;
}

export default ExportDialog;