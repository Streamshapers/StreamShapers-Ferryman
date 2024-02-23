import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faFileExport} from "@fortawesome/free-solid-svg-icons";
import React, {useContext, useState} from "react";
import ExportDialog from "./ExportDialog";
import ThemeSwitch from "./Theme/ThemeSwitch";
import {GlobalStateContext} from "./GlobalStateContext";

function Header() {
    const {jsonFile, theme} = useContext(GlobalStateContext);
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);

    return (
        <>
            <ExportDialog isOpen={isExportDialogOpen} onClose={closeExportDialog}/>
            <div id="headerContainer">
                <div className="headerSide">
                    {jsonFile && <JsonFileProcessor/>}
                </div>
                <div id="header-title">
                    <img id="logo-img" src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'} alt="logo"/>
                    <h1>Converter v1.0.0</h1>
                </div>
                <div className="headerSide">
                    <ThemeSwitch/>
                    <div id="downloadArea" className="headerButton" onClick={openExportDialog}>
                        <span>Export </span>
                        <FontAwesomeIcon icon={faFileExport} title="Export"/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;