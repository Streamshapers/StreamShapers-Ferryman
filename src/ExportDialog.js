import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "./GlobalStateContext";
import JSZip from 'jszip';

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
        setImagePath,
        markers,
        refImages
    } = useContext(GlobalStateContext);
    const [imageEmbed, setImageEmbed] = useState("embed");
    const [exportFormat, setExportFormat] = useState("html");
    const [allFontsLoaded, setAllFontsLoaded] = useState(false);
    const [startMarkerCheck, setStartMarkerCheck] = useState(false);
    const [stopMarkerCheck, setStopMarkerCheck] = useState(false);
    const [base64Images, setBase64Images] = useState([]);
    const [message, setMessage] = useState(null);

    if (isOpen) {
        setIsPlaying(false);
    }

    const showAlert = (msg, duration = 10000) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, duration);
    };

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

    useEffect(() => {
        if (jsonData && jsonData.assets) {
            const files = jsonData.assets
                .filter(asset => asset.p && asset.p.startsWith('data:image'))
                .map((asset, index) => {
                    const [header, base64] = asset.p.split(',');
                    const mime = header.match(/:(.*?);/)[1];
                    const bstr = atob(base64);
                    const n = bstr.length;
                    const u8arr = new Uint8Array(n);

                    for (let i = 0; i < n; i++) {
                        u8arr[i] = bstr.charCodeAt(i);
                    }

                    return new File([u8arr], `image_${index}.${mime.split('/')[1]}`, {type: mime});
                });

            setBase64Images(files);
        }
    }, [jsonData, imageEmbed]);

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
        const zip = new JSZip();
        let jsonWithoutImages = "";

        if (imagePath != null && !imagePath.endsWith("/")) {
            setImagePath(`${imagePath}/`);
            correctPath = `${imagePath}/`;
        } else {
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

                    let jsonDataString
                    if (imageEmbed === "embed") {
                        jsonDataString = JSON.stringify(jsonData);
                    } else if (imageEmbed === "extra") {
                        jsonDataString = JSON.stringify(jsonWithoutImages);
                    }
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

        if (exportFormat === 'html' || exportFormat === 'json') {
            if (imageEmbed === "extra") {
                zip.file(`${fileName}${extension}`, fileContent, {type: mimeType});

                let imageFolderName;
                if(imagePath.endsWith("/")){
                    imageFolderName = imagePath.slice(0, -1);
                }else{
                    imageFolderName = imagePath;
                }

                const imgFolder = zip.folder(imageFolderName);

                base64Images.forEach((file, index) => {
                    imgFolder.file(file.name, file);
                });

                zip.generateAsync({type: "blob"}).then(function (content) {
                    const url = URL.createObjectURL(content);
                    const downloadLink = document.createElement('a');
                    downloadLink.href = url;
                    downloadLink.download = `${fileName}.zip`;
                    document.body.appendChild(downloadLink);
                    downloadLink.click();
                    document.body.removeChild(downloadLink);
                    URL.revokeObjectURL(url);
                    showAlert("Download started!");
                });

                return;
            }
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
        showAlert("Download started!");
    };

    const handleExportFormat = (format) => () => {
        setExportFormat(format);
    };

    const handleImageExport = (option) => () => {
        setImageEmbed(option);
        console.log(imageEmbed)
    };

    const handleFileNameChange = (e) => {
        setFileName(e.target.value);
        console.log(fileName)
    };

    useEffect(() => {
        const startExists = markers.some(event => event.cm === 'start');
        const stopExists = markers.some(event => event.cm === 'stop');
        setStartMarkerCheck(startExists);
        setStopMarkerCheck(stopExists);
    }, [markers]);

    if (!isOpen) return null;

    return (<>
            <div className="overlay"></div>
            <div id="exportDialogWindow">
                <h2>Export</h2>
                {message && (
                    <div className="success-wrapper">
                        <div className="success alert-success">{message}</div>
                    </div>
                )}
                {!allFontsLoaded && <div className="alert-wrapper">
                    <div className="alert">
                        The animation contains fonts that you haven't uploaded.
                    </div>
                    <div className="alert">
                        This may result in some fonts not being displayed as intended in the animation.
                    </div>
                    <div className="alert">
                        Please close this dialog and upload all fonts in the fonts Tab.
                    </div>
                </div>}
                {!startMarkerCheck && <div className="alert-wrapper">
                    <div className="alert">
                        Your animation has no start marker and might not play correctly in CasparCG.
                    </div>
                </div>}
                {!stopMarkerCheck && <div className="alert-wrapper">
                    <div className="alert">
                        Your animation has no stop marker and might not play correctly in CasparCG.
                    </div>
                </div>}
                <div id="exportFileName">
                    <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                    <input type="text" id="fileNameInput" value={String(fileName)} onChange={handleFileNameChange}/>
                    <span id="fileType">.{exportFormat}</span>
                </div>
                <div id="exportOptions">
                    {refImages.length > 0 && <div id="image-export-options">
                        <RadioButton value={imageEmbed === 'embed'} label="Images embeded"
                                     onChange={handleImageExport("embed")}/>
                        <RadioButton value={imageEmbed === 'extra'} label="Images separately"
                                     onChange={handleImageExport('extra')}/>
                    </div>}
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