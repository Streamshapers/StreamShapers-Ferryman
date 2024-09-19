import React, {useContext} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";

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
                let base64Font = event.target.result;

                if (base64Font.startsWith('data:application/octet-stream') && file.name.endsWith('.otf')) {
                    base64Font = base64Font.replace('data:application/octet-stream', 'data:font/otf');
                } else if (base64Font.startsWith('data:application/octet-stream') && file.name.endsWith('.ttf')) {
                    base64Font = base64Font.replace('data:application/octet-stream', 'data:font/ttf');
                }

                console.log(base64Font)

                setUploadedFonts(prevUploadedFonts => ({
                    ...prevUploadedFonts,
                    [fontName]: base64Font
                }));

                if (jsonData && jsonData.fonts && jsonData.fonts.list) {
                    const updatedFontsList = jsonData.fonts.list.map(font => {
                        const fullName = `${font.fFamily}`;
                        //console.log('Comparing:', fullName, 'with', fontName);
                        if (fullName === fontName) {
                            //console.log('Updating font:', fullName);
                            return {...font, fPath: base64Font, fFamily: font.fFamily};
                        }
                        return font;
                    });
                    //console.log('Updated Fonts List:', updatedFontsList);
                    const timer = setTimeout(() => {
                        setJsonData({...jsonData, fonts: {...jsonData.fonts, list: updatedFontsList}});
                    }, 100);
                    return () => clearTimeout(timer);

                }
            } else {
                console.error('Uploaded format is not supported.');
            }
        };
        reader.readAsDataURL(file);
    };

    return (
        <div className="fonts-list">
            {fonts.map(font => {
                const isUploaded = uploadedFonts.hasOwnProperty(font);
                const indicatorId = `indicator_${font}`;
                const indicatorStyle = isUploaded ? {color: 'green'} : {color: 'red'};
                const indicator = isUploaded ? '✔' : '✖';

                return (
                    <div key={font} className='font-item'>
                        <span id={indicatorId} style={indicatorStyle}>{indicator}</span>
                        <div className="font-item-text">{font}</div>
                        <input type='file' accept='.ttf,.otf,.woff' onChange={(e) => uploadFont(e.target.files, font)}/>
                    </div>
                );
            })}
        </div>
    );
}

export default FontsDisplay;
