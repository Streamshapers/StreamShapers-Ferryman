import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faFileExport, faInfo} from "@fortawesome/free-solid-svg-icons";
import React, {useContext, useState} from "react";
import ExportDialog from "./ExportDialog";
import ThemeSwitch from "./Theme/ThemeSwitch";
import {GlobalStateContext} from "./GlobalStateContext";
import InfoDialog from "./InfoDialog";

function Header() {
    const {jsonFile, theme} = useContext(GlobalStateContext);
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);
    const openInfoDialog = () => setInfoDialogOpen(true);
    const closeInfoDialog = () => setInfoDialogOpen(false);

    return (
        <>
            <ExportDialog isOpen={isExportDialogOpen} onClose={closeExportDialog}/>
            <InfoDialog isOpen={isInfoDialogOpen} onClose={closeInfoDialog}/>
            <div id="headerContainer">
                <div className="headerSide">
                    {jsonFile && <JsonFileProcessor/>}
                </div>
                <div id="header-title">
                    <img id="logo-img" src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'} alt="logo"/>
                    <h1>Converter</h1>
                </div>
                <div className="headerSide">
                    <ThemeSwitch/>
                    <div id="info-button" className="headerButton" onClick={openInfoDialog}>
                        <FontAwesomeIcon icon={faCircleInfo} title="Export"/>
                    </div>
                    {jsonFile && <div id="downloadArea" className="headerButton" onClick={openExportDialog}>
                        <span>Export </span>
                        <FontAwesomeIcon icon={faFileExport} title="Export"/>
                    </div>}
                </div>
            </div>
        </>
    );
}

export default Header;