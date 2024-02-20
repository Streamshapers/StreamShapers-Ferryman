import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import React, {useState} from "react";
import ExportDialog from "./ExportDialog";
import ThemeSwitch from "./Theme/ThemeSwitch";

function Header() {
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);

    return (
        <>
            <ExportDialog isOpen={isExportDialogOpen} onClose={closeExportDialog}/>
            <div id="headerContainer">
                <div className="headerSide">
                    <JsonFileProcessor/>
                </div>
                <h1>StreamShapers Converter v1.0.0</h1>
                <div className="headerSide">
                    <ThemeSwitch />
                    <div id="downloadArea" className="headerButton" onClick={openExportDialog}>
                        <span>Export </span>
                        <FontAwesomeIcon icon={faFileExport} title="Exportieren"/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;