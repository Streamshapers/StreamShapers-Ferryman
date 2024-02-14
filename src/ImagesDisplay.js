import React, { useContext } from 'react';
import { GlobalStateContext } from './GlobalStateContext';

function ImagePreview() {
    const { images } = useContext(GlobalStateContext);

    return (
        <div id="imagePreview">
            {images.map((base64Image, index) => (
                <img className='imgPreview' key={index} src={base64Image} alt={`Preview ${index}`} />
            ))}
        </div>
    );
}

export default ImagePreview;
