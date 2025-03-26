import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "./GlobalStateContext";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function InfoDialog({isOpen, onClose}) {
    const {setIsPlaying, theme, ferrymanVersion} = useContext(GlobalStateContext);
    const [isImprintOpen, setIsImprintOpen] = useState(false);

    if (isOpen) {
        setIsPlaying(false);
    }

    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
    }, [isOpen]);

    if (!isOpen) return null;

    return (<>
            <div className="overlay"></div>
            <div id="infoDialogWindow">
                <div id="info-title">
                    <img id="logo-img" src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'} alt="logo"/>
                    <h1>Ferryman</h1>
                </div>
                <div id="info-version">
                    <h3>{ferrymanVersion}</h3>
                </div>
                <div>
                    <div className="accordion-wrapper">
                        <div className="accordion">
                            <div className="accordion-item imprint">
                                <h3 className="accordion-header" onClick={() => setIsImprintOpen(!isImprintOpen)}>
                                    <FontAwesomeIcon icon={isImprintOpen ? faChevronUp : faChevronDown}/> Imprint
                                </h3>
                                <div className="accordion-body" style={{display: isImprintOpen ? 'block' : 'none'}}>
                                    <p>StreamShapers by Jan-Philipp Peters, Nico Peters and Richard Weyer</p>
                                    <p>E-Mail: <a href="mailto:mail@streamshapers.com">mail@streamshapers.com</a></p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="info-copyright">
                    <div>
                        © StreamShapers 2025
                    </div>
                </div>
                <div className="popupButtonArea">
                    <button id="downloadBtn" onClick={onClose}>Close</button>
                </div>
            </div>
        </>
    )
        ;
}

export default InfoDialog;