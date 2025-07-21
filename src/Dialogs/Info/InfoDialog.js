import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faDiscord, faGithub, faInstagram, faYoutube} from "@fortawesome/free-brands-svg-icons";

function InfoDialog() {
    const {theme, ferrymanVersion, streamshapersUrl} = useContext(GlobalStateContext);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isContactOpen, setIsContactOpen] = useState(false);
    const [isLicenseOpen, setIsLicenseOpen] = useState(false);

    return (<>
            <div id="info-title">
                <img id="logo-img" src={theme === 'dark' ? './logo-light.png' : './logo-dark.png'} alt="logo"/>
                <h1>Ferryman</h1>
            </div>
            <div id="info-version">
                <h3>{ferrymanVersion}</h3>
            </div>

                <div className="accordion-wrapper">
                    <div className="accordion">
                        <div className="accordion-item infos">
                            <h3 className={`accordion-header ${isInfoOpen ? 'open' : ''}`} onClick={() => setIsInfoOpen(!isInfoOpen)}>
                                <FontAwesomeIcon icon={isInfoOpen ? faChevronUp : faChevronDown}/> Infos
                            </h3>
                            <div className={`accordion-body ${isInfoOpen ? 'open' : ''}`}>
                                <p>StreamShapers Ferryman created by Jan-Philipp Peters, Nico Peters and Richard Weyer</p>
                                <p> Read <a href={streamshapersUrl + "/imprint"}>Imprint</a> and <a href={streamshapersUrl + "/privacy-policy"}>Privacy Policy</a></p>
                            </div>
                        </div>
                        <div className="accordion-item License">
                            <h3 className={`accordion-header ${isLicenseOpen ? 'open' : ''}`} onClick={() => setIsLicenseOpen(!isLicenseOpen)}>
                                <FontAwesomeIcon icon={isLicenseOpen ? faChevronUp : faChevronDown}/> License
                            </h3>
                            <div className={`accordion-body ${isLicenseOpen ? 'open' : ''}`}>
                                <p> <b>Streamshapers Ferryman </b> is licensed under the GNU General Public License v3.0 (GPL-3.0).<br></br>
                                For more details, see the <a href="https://github.com/Streamshapers/StreamShapers-Ferryman/blob/master/LICENSE.txt">LICENSE</a> file.<br></br>
                                By contributing to this project, you agree to abide by its terms.
                                <br></br><br></br>
                                The included <b>Lottie Player</b> is provided under MIT <a href="https://github.com/LottieFiles/lottie-player/blob/master/LICENSE">LICENSE</a>
                                </p>
                            </div>
                        </div>
                        <div className="accordion-item Contact">
                            <h3 className={`accordion-header ${isContactOpen ? 'open' : ''}`} onClick={() => setIsContactOpen(!isContactOpen)}>
                                <FontAwesomeIcon icon={isContactOpen ? faChevronUp : faChevronDown}/> Contact
                            </h3>
                            <div className={`accordion-body ${isContactOpen ? 'open' : ''}`}>
                                <p>E-Mail: <a href="mailto:mail@streamshapers.com">mail@streamshapers.com</a></p>
                            </div>
                        </div>
                    </div>
                </div>

                                <div className="social-icons">
                                    <a href="https://discord.gg/ksNhRkzrM6" rel="noopener noreferrer"><FontAwesomeIcon icon={faDiscord} title="Discord"/></a>
                                    <a href="https://github.com/Streamshapers" rel="noopener noreferrer"><FontAwesomeIcon icon={faGithub} title="GitHub"/></a>
                                    <a href="https://www.instagram.com/streamshapers/" rel="noopener noreferrer"><FontAwesomeIcon icon={faInstagram} title="Instagram"/></a>
                                    <a href="https://www.youtube.com/@streamshapers" rel="noopener noreferrer"><FontAwesomeIcon icon={faYoutube} title="YouTube"/></a>
                                </div>
            <div id="info-copyright">
                <div>
                    © StreamShapers 2025
                </div>
            </div>
            <div className="popupButtonArea">
            </div>
        </>
    )
        ;
}

export default InfoDialog;
