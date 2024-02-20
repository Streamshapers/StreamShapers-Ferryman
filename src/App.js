import './App.css';
import JsonFileProcessor from "./JsonFileProcessor";
import {GlobalStateProvider} from "./GlobalStateContext";
import JsonElementsDisplay from "./ElementDisplays/JsonElementsDisplay";
import LottiePreview from "./LottiePreview";
import Splitter from "./Splitter";
import React, {useState} from "react";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import ExportDialog from "./ExportDialog";

function App() {
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);
    return (
        <GlobalStateProvider>
            <div id="content">
                <div id="headerContainer">
                    <div className="headerSide">
                        <JsonFileProcessor/>
                    </div>
                    <h1>StreamShapers Converter v1.0.0</h1>
                    <div className="headerSide">
                        <FontAwesomeIcon icon={faFileExport} className="headerButton" title="Exportieren"
                                         onClick={openExportDialog}>hallo</FontAwesomeIcon>
                    </div>
                </div>
                <div className="container">
                    <div id="contentWrapper">
                        <div id="previewContainer">
                            <div id="jsonElements"><JsonElementsDisplay/></div>
                            <Splitter/>
                            <div id="jsonPreview">{<LottiePreview/>}</div>
                        </div>
                    </div>
                </div>
            </div>
            <ExportDialog isOpen={isExportDialogOpen} onClose={closeExportDialog}/>
        </GlobalStateProvider>
    );
}

export default App;
