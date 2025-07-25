import React, {useContext, useEffect, useState} from 'react';
import {GlobalStateContext} from '../Context/GlobalStateContext';
import InfosDisplay from "./InfosDispaly";
import FontsDisplay from "./FontsDisplay";
import TextsDisplay from "./TextsDisplay";
import ImagesDisplay from "./ImagesDisplay";
import ColorsDisplay from "./ColorsDispaly";
import MarkersDisplay from "./MarkersDisplay";
import {faChevronDown, faChevronUp} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import GeneralAlerts from "../GeneralAlerts";


function JsonElementsDisplay() {
    const {jsonData, infos, fonts, textObjects, colors, images, generalAlerts} = useContext(GlobalStateContext);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isFontsOpen, setIsFontsOpen] = useState(false);
    const [isTextsOpen, setIsTextsOpen] = useState(false);
    const [isColorsOpen, setIsColorsOpen] = useState(false);
    const [isImagesOpen, setIsImagesOpen] = useState(false);
    const [isMarkersOpen, setIsMarkersOpen] = useState(false);

    useEffect(() => {
        if (generalAlerts.length > 0) {
            setIsInfoOpen(true);
        }
    }, [generalAlerts]);

    if (!jsonData) {
        return null;
    }

    return (
        <div className="accordion-wrapper">
            <div className="accordion">
                {infos && Object.keys(infos).length > 0 && (
                    <div className="accordion-item infos">
                        <h3 className={`accordion-header ${isInfoOpen ? 'open' : ''}`} onClick={() => setIsInfoOpen(!isInfoOpen)}>
                            <FontAwesomeIcon icon={isInfoOpen ? faChevronUp : faChevronDown}/> Info
                            {generalAlerts.length > 0 ? ` & ${generalAlerts.length} Alert${generalAlerts.length > 1 ? "s" : ""}` : ""}
                        </h3>
                        <div className={`accordion-body ${isInfoOpen ? 'open' : ''}`}>
                            <GeneralAlerts/>
                            <InfosDisplay/>
                        </div>
                    </div>
                )}
                {fonts && fonts.length > 0 && (
                    <div className="accordion-item fonts">
                        <h3 className={`accordion-header ${isFontsOpen ? 'open' : ''}`} onClick={() => setIsFontsOpen(!isFontsOpen)}>
                            <FontAwesomeIcon icon={isFontsOpen ? faChevronUp : faChevronDown}/> Fonts
                        </h3>
                        <div className={`accordion-body ${isFontsOpen ? 'open' : ''}`}>
                            <FontsDisplay/>
                        </div>
                    </div>
                )}
                {textObjects && textObjects.length > 0 && (
                    <div className="accordion-item texts">
                        <h3 className={`accordion-header ${isTextsOpen ? 'open' : ''}`} onClick={() => setIsTextsOpen(!isTextsOpen)}>
                            <FontAwesomeIcon icon={isTextsOpen ? faChevronUp : faChevronDown}/> Texts
                        </h3>
                        <div className={`accordion-body ${isTextsOpen ? 'open' : ''}`}>
                            <TextsDisplay/>
                        </div>
                    </div>
                )}
                {images && images.length > 0 && (
                    <div className="accordion-item images">
                        <h3 className={`accordion-header ${isImagesOpen ? 'open' : ''}`} onClick={() => setIsImagesOpen(!isImagesOpen)}>
                            <FontAwesomeIcon icon={isImagesOpen ? faChevronUp : faChevronDown}/> Images
                        </h3>
                        <div className={`accordion-body ${isImagesOpen ? 'open' : ''}`}>
                            <ImagesDisplay/>
                        </div>
                    </div>
                )}
                {/*{colors && colors.length > 0 && (
                    <div className="accordion-item colors">
                        <h3 className={`accordion-header ${isColorsOpen ? 'open' : ''}`} onClick={() => setIsColorsOpen(!isColorsOpen)}>
                            <FontAwesomeIcon icon={isColorsOpen ? faChevronUp : faChevronDown}/> Colors
                        </h3>
                        <div className={`accordion-body ${isColorsOpen ? 'open' : ''}`}>
                            <ColorsDisplay/>
                        </div>
                    </div>
                )}*/}
                {jsonData.markers && jsonData.markers.length > 0 && (
                    <div className="accordion-item markers">
                        <h3 className={`accordion-header ${isMarkersOpen ? 'open' : ''}`} onClick={() => setIsMarkersOpen(!isMarkersOpen)}>
                            <FontAwesomeIcon icon={isMarkersOpen ? faChevronUp : faChevronDown}/> Markers
                        </h3>
                        <div className={`accordion-body ${isMarkersOpen ? 'open' : ''}`}>
                            <MarkersDisplay/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JsonElementsDisplay;
