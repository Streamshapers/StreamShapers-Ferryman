import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../Context/GlobalStateContext";
import GeneralAlerts from "../GeneralAlerts";
import AuthContext from "../Context/AuthContext";
import ExportDialog from "./Export/ExportDialog";
import SaveDialog from "./Save/SaveDialog";
import InfoDialog from "./Info/InfoDialog";
import LoginDialog from "./Login/LoginDialog";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faXmark} from "@fortawesome/free-solid-svg-icons";

function Dialog({isOpen, onClose, type}) {
    const {user} = useContext(AuthContext);
    const {setIsPlaying} = useContext(GlobalStateContext);
    const [message, setMessage] = useState(null);

    useEffect(() => {
        if (isOpen) {
            setIsPlaying(false);
        }
    }, [isOpen, setIsPlaying]);

    const showAlert = (msg, duration = 10000) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, duration);
    };

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

    if (!isOpen) return null;

    let content;
    switch (type) {
        case "save":
            content = <SaveDialog onClose={onClose}/>;
            break;
        case "export":
            content = <ExportDialog onClose={onClose}/>;
            break;
        case "info":
            content = <InfoDialog/>;
            break;
        case "login":
            content = <LoginDialog onClose={onClose}/>;
            break;
        default:
            content = <div>Invalid dialog type</div>;
    }

    return (<>
            <div className="overlay"></div>
            <div className="dialog-window">
                <div className="close-icon" onClick={onClose}>
                    <FontAwesomeIcon icon={faXmark}/>
                </div>
                <GeneralAlerts/>
                {content}
            </div>
        </>
    )
        ;
}

export default Dialog;
