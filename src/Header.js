import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCircleInfo,
    faCircleQuestion,
    faFileExport,
    faNavicon, faRightToBracket,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import React, {useContext, useEffect, useRef, useState} from "react";
import ExportDialog from "./Export/ExportDialog";
import ThemeSwitch from "./Theme/ThemeSwitch";
import {GlobalStateContext} from "./Context/GlobalStateContext";
import AuthContext from "./Context/AuthContext";
import InfoDialog from "./InfoDialog";
import LoginDialog from "./LoginDialog";

function Header() {
    const {user, logout} = useContext(AuthContext);
    const {jsonFile, theme} = useContext(GlobalStateContext);
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
    const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);
    const openInfoDialog = () => setInfoDialogOpen(true);
    const closeInfoDialog = () => setInfoDialogOpen(false);
    const openLoginDialog = () => setLoginDialogOpen(true);
    const closeLoginDialog = () => setLoginDialogOpen(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef(null);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);
    };

    useEffect(() => {

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setDropdownOpen(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [dropdownRef]);

    const test = () => {
        console.log("logt test")
    }

    return (
        <>
            <ExportDialog isOpen={isExportDialogOpen} onClose={closeExportDialog}/>
            <InfoDialog isOpen={isInfoDialogOpen} onClose={closeInfoDialog}/>
            <LoginDialog isOpen={isLoginDialogOpen} onClose={closeLoginDialog}/>
            <div id="headerContainer">
                <div className="headerSide">
                    <div className="dropdown">
                        <FontAwesomeIcon icon={faNavicon}/>
                        <div className="dropdown-content">
                            <div className="dropdown-item">
                                {jsonFile && <JsonFileProcessor/>}
                            </div>
                            <ThemeSwitch/>
                            <a id="question-button" className="headerButton dropdown-item" title="Help"
                               href="https://www.streamshapers.com/docs/streamshapers-converter/">
                                <FontAwesomeIcon icon={faCircleQuestion}/>
                            </a>
                            <div id="info-button" className="headerButton dropdown-item" title="Info"
                                 onClick={openInfoDialog}>
                                <FontAwesomeIcon icon={faCircleInfo}/>
                            </div>
                            {jsonFile &&
                                <div id="downloadArea" className="headerButton dropdown-item" title="Export"
                                     onClick={openExportDialog}>
                                    <span>Export </span>
                                    <FontAwesomeIcon icon={faFileExport}/>
                                </div>}
                            <div id="login-button" className="headerButton dropdown-item" title="Login"
                                 ref={dropdownRef}
                                 onClick={openLoginDialog}>
                                <FontAwesomeIcon icon={faUser}/>
                                <span>Login</span>
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
                    <a id="question-button" className="headerButton headerButton1" title="Help"
                       href="https://www.streamshapers.com/docs/streamshapers-converter/">
                        <FontAwesomeIcon icon={faCircleQuestion}/>
                    </a>
                    <div id="info-button" className="headerButton headerButton1" title="Info" onClick={openInfoDialog}>
                        <FontAwesomeIcon icon={faCircleInfo}/>
                    </div>
                    {jsonFile &&
                        <div id="downloadArea" className="headerButton headerButton1" title="Export"
                             onClick={openExportDialog}>
                            <span>Export </span>
                            <FontAwesomeIcon icon={faFileExport}/>
                        </div>}
                    <div id="login-button" className="headerButton headerButton1" title="Login"
                         onClick={!user ? openLoginDialog : toggleDropdown}>
                        <FontAwesomeIcon icon={faUser}/>
                        <span>{user ? user.username : 'Login'}</span>
                        {dropdownOpen && (
                            <div className={`user-dropdown-content ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                                {user &&(
                                <a href="https://streamshapers.com" className="user-dropdown-item" target="_blank"
                                   onClick={test}>Settings</a>
                                )}
                                {user &&(
                                <div className="user-dropdown-item logout" onClick={logout}>
                                    Logout
                                    <FontAwesomeIcon icon={faRightToBracket}/>
                                </div>
                                )}
                            </div>
                        )}

                    </div>
                </div>
            </div>
        </>
    );
}

export default Header;