import React, {useContext, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';
import InfosDisplay from "./InfosDispaly";
import FontsDisplay from "./FontsDisplay";
import TextsDisplay from "./TextsDisplay";
import ImagesDisplay from "./ImagesDisplay";
import ColorsDisplay from "./ColorsDispaly";
import MarkersDisplay from "./MarkersDisplay";
import {faChevronDown, faChevronUp, faCircleInfo} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";


function JsonElementsDisplay() {
    const {jsonData, infos, fonts, texts, colors, images} = useContext(GlobalStateContext);
    const [isInfoOpen, setIsInfoOpen] = useState(false);
    const [isFontsOpen, setIsFontsOpen] = useState(false);
    const [isTextsOpen, setIsTextsOpen] = useState(false);
    const [isColorsOpen, setIsColorsOpen] = useState(false);
    const [isImagesOpen, setIsImagesOpen] = useState(false);
    const [isMarkersOpen, setIsMarkersOpen] = useState(false);

    if (!jsonData) {
        return null;
    }

    return (
        <div className="accordion-wrapper">
            <div className="accordion">
                {infos && Object.keys(infos).length > 0 && (
                    <div className="accordion-item infos">
                        <h3 className="accordion-header" onClick={() => setIsInfoOpen(!isInfoOpen)}>
                            <FontAwesomeIcon icon={isInfoOpen ? faChevronUp : faChevronDown}/> Info
                        </h3>
                        <div className="accordion-body" style={{display: isInfoOpen ? 'block' : 'none'}}>
                            <InfosDisplay/>
                        </div>
                    </div>
                )}
                {fonts && fonts.length > 0 && (
                    <div className="accordion-item fonts">
                        <h3 className="accordion-header" onClick={() => setIsFontsOpen(!isFontsOpen)}>
                            <FontAwesomeIcon icon={isFontsOpen ? faChevronUp : faChevronDown}/> Fonts
                        </h3>
                        <div className="accordion-body" style={{display: isFontsOpen ? 'block' : 'none'}}>
                            <FontsDisplay/>
                        </div>
                    </div>
                )}
                {texts && texts.length > 0 && (
                    <div className="accordion-item texts">
                        <h3 className="accordion-header" onClick={() => setIsTextsOpen(!isTextsOpen)}>
                            <FontAwesomeIcon icon={isTextsOpen ? faChevronUp : faChevronDown}/> Texts
                        </h3>
                        <div className="accordion-body" style={{display: isTextsOpen ? 'block' : 'none'}}>
                            <TextsDisplay/>
                        </div>
                    </div>
                )}
                {images && images.length > 0 && (
                    <div className="accordion-item images">
                        <h3 className="accordion-header" onClick={() => setIsImagesOpen(!isImagesOpen)}>
                            <FontAwesomeIcon icon={isImagesOpen ? faChevronUp : faChevronDown}/> Images
                        </h3>
                        <div className="accordion-body" style={{display: isImagesOpen ? 'block' : 'none'}}>
                            <ImagesDisplay/>
                        </div>
                    </div>
                )}
                {/*{colors && colors.length > 0 && (
                    <div className="accordion-item colors">
                        <h3 className="accordion-header" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                            <FontAwesomeIcon icon={isColorsOpen ? faChevronUp : faChevronDown}/> Colors
                        </h3>
                        <div className="accordion-body" style={{display: isColorsOpen ? 'block' : 'none'}}>
                            <ColorsDisplay/>
                        </div>
                    </div>
                )}*/}
                {jsonData.markers && jsonData.markers.length > 0 && (
                    <div className="accordion-item markers">
                        <h3 className="accordion-header" onClick={() => setIsMarkersOpen(!isMarkersOpen)}>
                            <FontAwesomeIcon icon={isMarkersOpen ? faChevronUp : faChevronDown}/> Markers
                        </h3>
                        <div className="accordion-body" style={{display: isMarkersOpen ? 'block' : 'none'}}>
                            <MarkersDisplay/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JsonElementsDisplay;
