import React, {useContext, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';
import InfosDisplay from "./InfosDispaly";
import FontsDisplay from "./FontsDisplay";
import TextsDisplay from "./TextsDisplay";
import ImagesDisplay from "./ImagesDisplay";
import ColorsDisplay from "./ColorsDispaly";
import MarkersDisplay from "./MarkersDisplay";


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
                            <i className={`fas ${isInfoOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Info
                        </h3>
                        <div className="accordion-body" style={{display: isInfoOpen ? 'block' : 'none'}}>
                            <InfosDisplay/>
                        </div>
                    </div>
                )}
                {fonts && fonts.length > 0 && (
                    <div className="accordion-item fonts">
                        <h3 className="accordion-header" onClick={() => setIsFontsOpen(!isFontsOpen)}>
                            <i className={`fas ${isFontsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Fonts
                        </h3>
                        <div className="accordion-body" style={{display: isFontsOpen ? 'block' : 'none'}}>
                            <FontsDisplay/>
                        </div>
                    </div>
                )}
                {texts && texts.length > 0 && (
                    <div className="accordion-item texts">
                        <h3 className="accordion-header" onClick={() => setIsTextsOpen(!isTextsOpen)}>
                            <i className={`fas ${isTextsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Texts
                        </h3>
                        <div className="accordion-body" style={{display: isTextsOpen ? 'block' : 'none'}}>
                            <TextsDisplay/>
                        </div>
                    </div>
                )}
                {colors && colors.length > 0 && (
                    <div className="accordion-item colors">
                        <h3 className="accordion-header" onClick={() => setIsColorsOpen(!isColorsOpen)}>
                            <i className={`fas ${isColorsOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Colors
                        </h3>
                        <div className="accordion-body" style={{display: isColorsOpen ? 'block' : 'none'}}>
                            <ColorsDisplay/>
                        </div>
                    </div>
                )}
                {jsonData.markers && jsonData.markers.length > 0 && (
                    <div className="accordion-item markers">
                        <h3 className="accordion-header" onClick={() => setIsMarkersOpen(!isMarkersOpen)}>
                            <i className={`fas ${isMarkersOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Marker
                        </h3>
                        <div className="accordion-body" style={{display: isMarkersOpen ? 'block' : 'none'}}>
                            <MarkersDisplay/>
                        </div>
                    </div>
                )}
                {images && images.length > 0 && (
                    <div className="accordion-item images">
                        <h3 className="accordion-header" onClick={() => setIsImagesOpen(!isImagesOpen)}>
                            <i className={`fas ${isImagesOpen ? 'fa-chevron-up' : 'fa-chevron-down'}`}></i> Images
                        </h3>
                        <div className="accordion-body" style={{display: isImagesOpen ? 'block' : 'none'}}>
                            <ImagesDisplay/>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default JsonElementsDisplay;
