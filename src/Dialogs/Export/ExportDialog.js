import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import JSZip from 'jszip';
import SpxExport from "./SpxExport";
import GddExport from "./GddExport";
import GeneralAlerts from "../../GeneralAlerts";
import AuthContext from "../../Context/AuthContext";
import api from "../../axiosInstance";
import OgrafExport from "./OgrafExport";

function ExportDialog({onClose}) {
    const {user} = useContext(AuthContext);
    const {
        jsonData,
        saveTemplate,
        fileName,
        setFileName,
        uploadedFonts,
        fonts,
        imagePath,
        ografManifest,
        refImages,
        generateJsonWithoutImages,
        imageEmbed,
        setImageEmbed,
        exportFormat,
        setExportFormat,
        mimeType,
        generateFile,
        remainingUploads,
        getTemplateLimit,
        sendStatistic
    } = useContext(GlobalStateContext);

    const [allFontsLoaded, setAllFontsLoaded] = useState(false);
    const [base64Images, setBase64Images] = useState([]);
    const [message, setMessage] = useState(null);
    const [activeTab, setActiveTab] = useState('default');
    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [saveToAccount, setSaveToAccount] = useState(false);

    useEffect(() => {
        getTemplateLimit();
        if (user) {
            api.get('/projects')
                .then(res => setProjects(res.data))
                .catch(() => setProjects([]));
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

    const triggerDownload = (blob, downloadName) => {
        const url = URL.createObjectURL(blob);
        const downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = downloadName;
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
        URL.revokeObjectURL(url);
    };

    const downloadFile = async () => {
        let fileContent;
        const extension = "." + exportFormat;
        const fileNameWithExt = `${fileName}${extension}`;
        const zip = new JSZip();

        if (user && saveToAccount && remainingUploads > 0) {
            handleSaveTemplate();
        }

        if (exportFormat === 'html' || exportFormat === 'json') {
            try {
                fileContent = await generateFile(1);
            } catch (error) {
                console.log("Error generating File", error);
                showAlert("File generation failed!");
                return;
            }

            if (imageEmbed === "extra") {
                const imageFolderName = imagePath.endsWith("/")
                    ? imagePath.slice(0, -1)
                    : imagePath;
                const imgFolder = zip.folder(imageFolderName);

                base64Images.forEach(file => {
                    imgFolder.file(file.name, file);
                });

                zip.file(fileNameWithExt, fileContent, {type: mimeType});

                zip.generateAsync({type: "blob"}).then(blob => {
                    triggerDownload(blob, `${fileName}.zip`);
                    showAlert("Download started!");
                });

                return;
            }
        }

        if (exportFormat === "ograf") {
            try {
                const graphicFile = await generateFile(1);
                const lottieTemplateFile = JSON.stringify(generateJsonWithoutImages());
                const lottiePlayerText = await (await fetch('/template/Ograf/lib/lottie-player.js')).text();
                const manifestText = JSON.stringify(ografManifest);

                const libFolder = zip.folder('lib');

                const imageFolderName = imagePath.endsWith("/")
                    ? imagePath.slice(0, -1)
                    : imagePath;
                const imgFolder = libFolder.folder(imageFolderName.toString());

                base64Images.forEach(file => {
                    imgFolder.file(file.name, file);
                });

                libFolder.file("lottie-player.js", lottiePlayerText);
                libFolder.file("lottie-template.json", lottieTemplateFile);
                zip.file("graphic.mjs", graphicFile, {type: mimeType});
                zip.file("manifest.json", manifestText);

                //zip.file(fileNameWithExt, fileContent, {type: mimeType});

                zip.generateAsync({type: "blob"}).then(blob => {
                    triggerDownload(blob, `${fileName}.zip`);
                    showAlert("Download started!");
                });

                sendStatistic({
                    client: 'ferryman',
                    event: 'export',
                    type: exportFormat,
                    details: {
                        template: fileName,
                        user: user ? user.email : null,
                        imageEmbed,
                        projectId: selectedProjectId,
                        refImagesCount: refImages.length
                    }
                });
                return;
            } catch (error) {
                console.log("Error generating OGraf File", error);
                showAlert("OGraf export failed!");
                return;
            }
        }

        // Standard-Download (HTML, JSON)
        try {
            const blob = new Blob([fileContent], {type: mimeType});
            triggerDownload(blob, fileNameWithExt);
            showAlert("Download started!");
            sendStatistic({
                client: 'ferryman',
                event: 'export',
                type: exportFormat,
                details: {
                    template: fileName,
                    user: user ? user.email : null,
                    imageEmbed,
                    projectId: selectedProjectId,
                    refImagesCount: refImages.length
                }
            });
        } catch (error) {
            console.log("Error during download", error);
            showAlert("Download failed!");
        }
        //onClose();
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

    const handleSaveTemplate = () => {
        saveTemplate(fileName, selectedProjectId || null);
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
                {exportFormat === 'ograf' && 1 === 0 && (
                    <button className={`tab-button ${activeTab === 'ograf' ? 'active' : ''}`}
                            onClick={() => handleTabChange('ograf')}>Ograf
                    </button>
                )}
                {exportFormat !== 'ograf' && (
                    <button className={`tab-button ${activeTab === 'spx' ? 'active' : ''}`}
                            onClick={() => handleTabChange('spx')}>SPX
                    </button>
                )}
            </div>
            {activeTab === 'default' && (
                <div className="tab-content general">
                    <div id="exportFileName">
                        <label htmlFor="fileNameInput" id="fileNameInputLabel">Filename:</label>
                        <input type="text" id="fileNameInput" value={String(fileName)}
                               onChange={handleFileNameChange}/>
                        <span id="fileType">{exportFormat === "ograf" ? ".zip" : `.${exportFormat}`}</span>
                    </div>
                    {refImages.length > 0 && exportFormat !== 'ograf' && (
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
                        <RadioButton value={exportFormat === 'ograf'} label="Ograf-Template (Beta)"
                                     onChange={handleExportFormat("ograf")}/>
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
                                <span
                                    className="remaining-uploads"> ({remainingUploads} upload{remainingUploads > 1 ? 's' : ''} left.<a href="https://streamshapers.com/plans"><span className="upgrade-plan">Upgrade Plan</span></a>)</span>
                            </div>
                            {saveToAccount && (
                                <div className="row">
                                    <span>Project</span>
                                    <select
                                        id="project-select"
                                        value={selectedProjectId}
                                        onChange={e => setSelectedProjectId(e.target.value)}
                                    >
                                        <option value="">No project</option>
                                        {projects.map(project => (
                                            <option key={project._id} value={project._id}>
                                                {project.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
            {activeTab === 'ograf' && (
                <OgrafExport/>
            )}
            {activeTab === 'spx' && (
                <SpxExport/>
            )}
            <div className="popupButtonArea">
                <button id="downloadBtn" onClick={downloadFile}>Download File</button>
            </div>
        </>
    )
        ;
}

export default ExportDialog;
