import React, {useContext} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";

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

        const reader = new FileReader();
        reader.onload = function (event) {
            if (typeof event.target.result === 'string') {
                setUploadedFonts(prevUploadedFonts => ({
                    ...prevUploadedFonts,
                    [fontName]: event.target.result
                }));

                if (jsonData && jsonData.fonts && jsonData.fonts.list) {
                    const updatedFontsList = jsonData.fonts.list.map(font => {
                        const name = font.fFamily + " " + font.fStyle;
                        if (name === fontName) {
                            return {...font, fPath: "", fFamily: name};
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
                        <input type='file' accept='.ttf,.otf,.woff' onChange={(e) => uploadFont(e.target.files, font)}/>
                    </div>
                );
            })}
        </div>
    );
}

export default FontsDisplay;
