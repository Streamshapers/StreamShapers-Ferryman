import JsonFileProcessor from "./JsonFileProcessor";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faCircleInfo,
    faCircleQuestion,
    faFileExport,
    faNavicon, faRightToBracket, faSave,
    faUser
} from "@fortawesome/free-solid-svg-icons";
import React, {useContext, useEffect, useRef, useState} from "react";
import ThemeSwitch from "./Theme/ThemeSwitch";
import {GlobalStateContext} from "./Context/GlobalStateContext";
import AuthContext from "./Context/AuthContext";
import Dialog from "./Dialogs/Dialog";
import {Link} from "react-router-dom";

function Header() {
    const {user, handleLogout} = useContext(AuthContext);
    const {jsonFile, theme, streamshapersUrl} = useContext(GlobalStateContext);
    const [isExportDialogOpen, setExportDialogOpen] = useState(false);
    const [isInfoDialogOpen, setInfoDialogOpen] = useState(false);
    const [isLoginDialogOpen, setLoginDialogOpen] = useState(false);
    const [isSaveDialogOpen, setSaveDialogOpen] = useState(false);
    const openExportDialog = () => setExportDialogOpen(true);
    const closeExportDialog = () => setExportDialogOpen(false);
    const openInfoDialog = () => setInfoDialogOpen(true);
    const closeInfoDialog = () => setInfoDialogOpen(false);
    const openLoginDialog = () => setLoginDialogOpen(true);
    const closeLoginDialog = () => setLoginDialogOpen(false);
    const openSaveDialog = () => setSaveDialogOpen(true);
    const closeSaveDialog = () => setSaveDialogOpen(false);
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
            <Dialog isOpen={isExportDialogOpen} onClose={closeExportDialog} type='export'/>
            <Dialog isOpen={isInfoDialogOpen} onClose={closeInfoDialog} type='info'/>
            <Dialog isOpen={isLoginDialogOpen} onClose={closeLoginDialog} type='login'/>
            <Dialog isOpen={isSaveDialogOpen} onClose={closeSaveDialog} type="save" />
            <div id="headerContainer">
                <div className="headerSide">
                    <div className="dropdown headerButton">
                        <FontAwesomeIcon icon={faNavicon}/>
                        <div className="dropdown-content">
                            <div className="dropdown-item">
                                {jsonFile && <JsonFileProcessor/>}
                            </div>
                            {user &&
                                <div className="headerButton dropdown-item" title="Save to Your StreamShapers Account"
                                     onClick={() => openSaveDialog()}>
                                    <span>Save</span>
                                    <FontAwesomeIcon icon={faSave}/>
                                </div>
                            }
                            {jsonFile &&
                                <div id="downloadArea" className="headerButton dropdown-item" title="Export"
                                     onClick={openExportDialog}>
                                    <span>Export </span>
                                    <FontAwesomeIcon icon={faFileExport}/>
                                </div>
                            }
                            <ThemeSwitch/>
                            <a id="question-button" className="headerButton dropdown-item" title="Help"
                               href="https://www.streamshapers.com/docs/streamshapers-converter/">
                                <FontAwesomeIcon icon={faCircleQuestion}/>
                            </a>
                            <div id="info-button" className="headerButton dropdown-item" title="Info"
                                 onClick={openInfoDialog}>
                                <FontAwesomeIcon icon={faCircleInfo}/>
                            </div>
                        </div>
                    </div>
                    {jsonFile &&
                        <>
                            <JsonFileProcessor/>
                            {user &&
                                <div className="headerButton" title="Save to Your StreamShapers Account"
                                     onClick={() => openSaveDialog()}>
                                    <span>Save</span>
                                    <FontAwesomeIcon icon={faSave}/>
                                </div>
                            }
                            <div id="downloadArea" className="headerButton headerButton1" title="Export"
                                 onClick={openExportDialog}>
                                <span>Export </span>
                                <FontAwesomeIcon icon={faFileExport}/>
                            </div>
                        </>
                    }
                </div>
                <div id="header-title">
                    <a href="https://www.streamshapers.com/"><img id="logo-img"
                                                                  src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'}
                                                                  alt="logo"/></a>
                    <h1>Ferryman</h1>
                </div>
                <div className="headerSide">
                    <ThemeSwitch/>
                    <a id="question-button" className="headerButton headerButton1" title="Help" target="_blank"
                       rel="noopener" href="https://www.streamshapers.com/docs/streamshapers-converter/">
                        <FontAwesomeIcon icon={faCircleQuestion}/>
                    </a>
                    <div id="info-button" className="headerButton headerButton1" title="Info" onClick={openInfoDialog}>
                        <FontAwesomeIcon icon={faCircleInfo}/>
                    </div>
                    <div id="login-button" className="headerButton headerButton1" title="Login"
                         onClick={!user ? openLoginDialog : toggleDropdown}>
                        {user && user.profileImage ? (
                            <img
                                src={`https://server.streamshapers.com${user.profileImage}`}
                                alt="Profile"
                                className="header-profile-image"
                            />
                        ) : (
                            <FontAwesomeIcon icon={faUser} title="Account" />
                        )}
                        <span>{user ? user.username : 'Login'}</span>
                        {dropdownOpen && (
                            <div className={`user-dropdown-content ${dropdownOpen ? 'open' : ''}`} ref={dropdownRef}>
                                {user &&(
                                <>
                                    <a href={streamshapersUrl + "/dashboard"} className="user-dropdown-item" target="_blank">Dashboard</a>
                                    <a href={streamshapersUrl + "/settings"} className="user-dropdown-item" target="_blank">Account Settings</a>
                                </>
                                )}
                                {user &&(
                                <div className="user-dropdown-item logout" onClick={handleLogout}>
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
