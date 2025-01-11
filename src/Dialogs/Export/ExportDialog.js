import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import JSZip from 'jszip';
import SpxExport from "./SpxExport";
import GddExport from "./GddExport";
import GeneralAlerts from "../../GeneralAlerts";
import AuthContext from "../../Context/AuthContext";
import api from "../../axiosInstance";

function ExportDialog({ onClose }) {
    const {user} = useContext(AuthContext);
    const {
        jsonData,
        saveTemplate,
        fileName,
        setFileName,
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
        generateFile,
        remainingUploads,
        getTemplateLimit
    } = useContext(GlobalStateContext);

    const [allFontsLoaded, setAllFontsLoaded] = useState(false);
    const [base64Images, setBase64Images] = useState([]);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('default');
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [saveToAccount, setSaveToAccount] = useState(false);

    useEffect(() => {
        getTemplateLimit();
        if (user && user.categories) {
            setCategories(user.categories);
        }
    }, []);

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

    const downloadFile = async () => {
        let fileContent;
        const zip = new JSZip();
        const extension = "." + exportFormat;

        if (user && saveToAccount && remainingUploads > 0) {
            handleSaveTemplate();
        }

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
        onClose();
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

    const handleSaveToAccountCheckbox = (e) => {
        setSaveToAccount(!saveToAccount);
    };

    const handleNewCategoryChange = (e) => {
        setNewCategory(e.target.value);
    };

    const handleSaveTemplate = () => {
        const category = newCategory || document.getElementById('category-select').value;
        saveTemplate(fileName, category);
    };

    return (<>
            <h2>Export</h2>
            {message && (
                <div className="success-wrapper">
                    <div className="success alert-success">{message}</div>
                </div>
            )}
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
                    <div className="tab-content general">
                        <div id="exportFileName">
                            <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                            <input type="text" id="fileNameInput" value={String(fileName)}
                                   onChange={handleFileNameChange}/>
                            <span id="fileType">.{exportFormat}</span>
                        </div>
                        {refImages.length > 0 && (
                            <div id="image-export-options">
                                <RadioButton value={imageEmbed === 'embed'} label="Images embeded"
                                             onChange={handleImageExport("embed")}/>
                                <RadioButton value={imageEmbed === 'extra'} label="Images separately"
                                             onChange={handleImageExport('extra')}/>
                            </div>
                        )}
                        <div id="export-format">
                            <RadioButton value={exportFormat === 'html'} label="HTML-Template"
                                         onChange={handleExportFormat("html")}/>
                            <RadioButton value={exportFormat === 'json'} label="JSON"
                                         onChange={handleExportFormat('json')}/>
                            {/* <option value="separate">Separate HTML und JSON (Zip)</option> */}
                        </div>
                        {user && (
                            <div id="save-in-account">
                                <div className="row">
                                    <input type="checkbox" id="save-in-account" name="save-in-account"
                                           checked={saveToAccount}
                                           disabled={remainingUploads <= 0} onChange={handleSaveToAccountCheckbox}/>
                                    <label htmlFor="save-in-account">Save to StreamShapers Account on Export</label>
                                    <span className="remaining-uploads"> ({remainingUploads} upload{remainingUploads > 1 ? 's' : ''} left. Upgrade Plan)</span>
                                </div>
                                {saveToAccount && (
                                    <div className="row">
                                        <span>Optional: Category</span>
                                        {categories.length > 0 ? (
                                            <>
                                                <select id="category-select">
                                                    <option value="">Select Category</option>
                                                    {categories.map((cat, index) => (
                                                        <option key={index} value={cat}>{cat}</option>
                                                    ))}
                                                </select>
                                                <p>or</p>
                                            </>
                                        ) : (
                                            <></>
                                        )}
                                        <input type="text" placeholder="New Category" id="category" value={newCategory}
                                               onChange={handleNewCategoryChange}/>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                )}
                {activeTab === 'spx' && (
                    <SpxExport/>
                )}
                {/*activeTab === 'gdd' && (
                    <GddExport/>
                )*/}
                <div className="popupButtonArea">
                    <button id="downloadBtn" onClick={downloadFile}>Download File</button>
                </div>
        </>
    )
        ;
}

export default ExportDialog;