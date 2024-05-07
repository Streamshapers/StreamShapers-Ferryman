import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faCircleInfo, faCircleQuestion, faFileExport, faNavicon} from "@fortawesome/free-solid-svg-icons";
import React, {useContext, useState} from "react";
import ExportDialog from "./Export/ExportDialog";
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
                    <div className="dropdown">
                        <FontAwesomeIcon icon={faNavicon} />
                        <div className="dropdown-content">
                            <div className="dropdown-item">
                                {jsonFile && <JsonFileProcessor/>}
                            </div>
                            <ThemeSwitch/>
                            <a id="question-button" className="headerButton dropdown-item"
                               href="https://www.streamshapers.com/docs/streamshapers-converter/">
                                <FontAwesomeIcon icon={faCircleQuestion} title="Help"/>
                            </a>
                            <div id="info-button" className="headerButton dropdown-item" onClick={openInfoDialog}>
                                <FontAwesomeIcon icon={faCircleInfo} title="Export"/>
                            </div>
                        </div>
                    </div>
                    {jsonFile && <JsonFileProcessor/>}
                </div>
                <div id="header-title">
                    <a href="https://www.streamshapers.com/"><img id="logo-img"
                                                                  src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'}
                                                                  alt="logo"/></a>
                    <h1>Ferryman</h1>
                </div>
                <div className="headerSide">
                    <ThemeSwitch/>
                    <a id="question-button" className="headerButton headerButton1"
                       href="https://www.streamshapers.com/docs/streamshapers-converter/">
                        <FontAwesomeIcon icon={faCircleQuestion} title="Help"/>
                    </a>
                    <div id="info-button" className="headerButton headerButton1" onClick={openInfoDialog}>
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