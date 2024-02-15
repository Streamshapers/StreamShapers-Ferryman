import React, {useContext} from 'react';
import {GlobalStateContext} from "./GlobalStateContext";

function FontsDisplay() {
    const {jsonData, setJsonData, fonts, uploadedFonts, setUploadedFonts} = useContext(GlobalStateContext);

    if (!fonts) {
        return <div>Loading...</div>;
    }

    const uploadFont = (files, fontName) => {
        const file = files[0];
        if (!file) {
            return;
        }

        let format;
        if (file.name.endsWith('.woff')) {
            format = 'woff';
        } else if (file.name.endsWith('.ttf')) {
            format = 'truetype';
        } else if (file.name.endsWith('.otf')) {
            format = 'opentype';
        }

        const reader = new FileReader();
        reader.onload = function (event) {
            if (typeof event.target.result === 'string') {
                // Aktualisieren des uploadedFonts Zustands
                setUploadedFonts(prevUploadedFonts => ({
                    ...prevUploadedFonts,
                    [fontName]: event.target.result
                }));

                // Aktualisieren des jsonData Zustands, um die fontPath zu leeren
                if (jsonData && jsonData.fonts && jsonData.fonts.list) {
                    const updatedFontsList = jsonData.fonts.list.map(font => {
                        if (font.fFamily === fontName) {
                            return {...font, fPath: ""};
                        }
                        return font;
                    });
                    const timer = setTimeout(() => {
                        setJsonData({...jsonData, fonts: {...jsonData.fonts, list: updatedFontsList}});
                    }, 100);//Timeout damit Font richtig dargestellt wird
                    return () => clearTimeout(timer);
                }
            } else {
                console.error('Uploaded format is not supported.');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div>
            {fonts.map(font => {
                const isUploaded = uploadedFonts.hasOwnProperty(font);
                const indicatorId = `indicator_${font}`;
                const indicatorStyle = isUploaded ? {color: 'green'} : {color: 'red'};
                const indicator = isUploaded ? '✔' : '✖';

                return (
                    <div key={font} className='font-item'>
                        <span id={indicatorId} style={indicatorStyle}>{indicator}</span>
                        {font}
                        <input type='file' accept='.ttf' onChange={(e) => uploadFont(e.target.files, font)}/>
                    </div>
                );
            })}
        </div>
    );
}

export default FontsDisplay;
