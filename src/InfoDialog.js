import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "./GlobalStateContext";
import InfosDisplay from "./ElementDisplays/InfosDispaly";

function InfoDialog({isOpen, onClose}) {
    const {setIsPlaying, theme} = useContext(GlobalStateContext);
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
                    <h1>Converter</h1>
                </div>
                <div id="info-version">
                    <h3>v1.4.0</h3>
                </div>
                <div>
                    <div className="accordion-wrapper">
                        <div className="accordion">
                            <div className="accordion-item imprint">
                                <h3 className="accordion-header" onClick={() => setIsImprintOpen(!isImprintOpen)}>
                                    <i className={`fas ${isImprintOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Imprint
                                </h3>
                                <div className="accordion-body" style={{display: isImprintOpen ? 'block' : 'none'}}>
                                    <p>StreamShapers by Jan-Philipp Peters, Nico Peters and Richard Weyer</p>
                                    <p>E-Mail: mail@streamshapers.com</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="info-copyright">
                    <div>
                        © StreamShapers 2024
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