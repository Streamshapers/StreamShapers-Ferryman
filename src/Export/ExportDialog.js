import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../Context/GlobalStateContext";
import JSZip from 'jszip';
import SpxExport from "./SpxExport";
import GddExport from "./GddExport";
import GeneralAlerts from "../GeneralAlerts";

function ExportDialog({isOpen, onClose}) {
    const {
        jsonData,
        ferrymanVersion,
        fileName,
        setFileName,
        setIsPlaying,
        fontFaces,
        uploadedFonts,
        fonts,
        imagePath,
        setImagePath,
        markers,
        refImages,
        SPXGCTemplateDefinition,
        spxExport,
        googleTableCells,
        imageEmbed,
        setImageEmbed,
        exportFormat,
        setExportFormat,
        mimeType,
        setMimeType,
        generateFile
    } = useContext(GlobalStateContext);

    const [allFontsLoaded, setAllFontsLoaded] = useState(false);
    const [startMarkerCheck, setStartMarkerCheck] = useState(false);
    const [stopMarkerCheck, setStopMarkerCheck] = useState(false);
    const [base64Images, setBase64Images] = useState([]);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('default');


    useEffect(() => {
        if (isOpen) {
            setIsPlaying(false);
        }
    }, [isOpen, setIsPlaying]);



    const handleTabChange = tabName => {
        setActiveTab(tabName);
    };

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
        const zip = new JSZip();
        const extension = "." + exportFormat;

        try {
            fileContent = await generateFile();
        } catch (error) {
            console.log("Error generating File", error);
        }

        if (exportFormat === 'html' || exportFormat === 'json') {
            if (imageEmbed === "extra") {
                zip.file(`${fileName}${extension}`, fileContent, {type: mimeType});

                let imageFolderName;
                if (imagePath.endsWith("/")) {
                    imageFolderName = imagePath.slice(0, -1);
                } else {
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
                <GeneralAlerts/>
                <div className="tab-navigation">
                    <button className={`tab-button ${activeTab === 'default' ? 'active' : ''}`}
                            onClick={() => handleTabChange('default')}>General
                    </button>
                    <button className={`tab-button ${activeTab === 'spx' ? 'active' : ''}`}
                            onClick={() => handleTabChange('spx')}>SPX
                    </button>
                    {/*<button className={`tab-button ${activeTab === 'gdd' ? 'active' : ''}`}
                            onClick={() => handleTabChange('gdd')}>GDD
                    </button>*/}
                </div>
                {activeTab === 'default' && (
                    <div className="tab-content">
                        <div id="exportFileName">
                            <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                            <input type="text" id="fileNameInput" value={String(fileName)}
                                   onChange={handleFileNameChange}/>
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
                                <RadioButton value={exportFormat === 'html'} label="HTML-Template"
                                             onChange={handleExportFormat("html")}/>
                                <RadioButton value={exportFormat === 'json'} label="JSON"
                                             onChange={handleExportFormat('json')}/>
                                {/* <option value="separate">Separate HTML und JSON (Zip)</option> */}
                            </div>
                        </div>
                    </div>
                )}
                {activeTab === 'spx' && (
                    <SpxExport/>
                )}
                {/*activeTab === 'gdd' && (
                    <GddExport/>
                )*/}
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