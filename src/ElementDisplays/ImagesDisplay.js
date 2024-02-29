import React, { useContext, useEffect, useState } from 'react';
import { GlobalStateContext } from '../GlobalStateContext';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {faUndoAlt, faUpload} from '@fortawesome/free-solid-svg-icons';

function ImagePreview() {
    const { jsonData, setJsonData, jsonFile } = useContext(GlobalStateContext);
    const [imageAssets, setImageAssets] = useState([]);
    // Einführung eines neuen Zustands für die Speicherung der Originalwerte
    const [originalValues, setOriginalValues] = useState([]);

    useEffect(() => {
        const initialImageAssets = jsonData.assets
            .filter(asset => asset.p.startsWith('data:image'))
            .map(asset => ({
                src: asset.p,
                width: asset.w,
                height: asset.h,
                id: asset.id
            }));

        setImageAssets(initialImageAssets);

        // Speichere die Originalwerte in einem separaten Zustand
        const originalAssetValues = jsonData.assets
            .filter(asset => asset.p.startsWith('data:image'))
            .map(asset => ({
                originalWidth: asset.w,
                originalHeight: asset.h,
                id: asset.id
            }));

        setOriginalValues(originalAssetValues);
        console.log(originalAssetValues)
    }, [jsonFile]);

    const updateAssetSize = (index, dimension, value) => {
        const updatedAssets = [...imageAssets];
        updatedAssets[index][dimension] = Number(value);
        setImageAssets(updatedAssets);

        const updatedJsonData = {...jsonData};
        const assetId = imageAssets[index].id;
        const assetIndex = updatedJsonData.assets.findIndex(a => a.id === assetId);
        if (assetIndex !== -1) {
            updatedJsonData.assets[assetIndex][dimension === 'width' ? 'w' : 'h'] = Number(value);
            setJsonData(updatedJsonData);
        }
    };

    const resetToOriginal = (index, dimension) => {
        const assetId = imageAssets[index].id;
        const originalAsset = originalValues.find(o => o.id === assetId);
        if (originalAsset) {
            const originalValue = originalAsset[dimension === 'width' ? 'originalWidth' : 'originalHeight'];
            updateAssetSize(index, dimension, originalValue);
        }
    };

    const replaceImage = async (index) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await convertToBase64(file);
                const updatedAssets = [...imageAssets];
                updatedAssets[index].src = base64;
                setImageAssets(updatedAssets);

                // Aktualisieren Sie auch die jsonData
                const updatedJsonData = { ...jsonData };
                updatedJsonData.assets[index].p = base64;
                setJsonData(updatedJsonData);
            }
        };
        fileInput.click();
    };

    const convertToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = () => resolve(reader.result);
            reader.onerror = (error) => reject(error);
        });
    };

    return (
        <div id="image-preview">
            {imageAssets.map((asset, index) => (
                <div key={asset.id} className="image-preview-wrapper">
                    <img className='imgPreview' src={asset.src} alt={`Preview ${index}`} />
                    <div className="img-input-wrapper">
                        <input
                            type="number"
                            value={asset.width}
                            onChange={(e) => updateAssetSize(index, 'width', e.target.value)}
                            placeholder="Width"
                        />
                        <FontAwesomeIcon icon={faUndoAlt} onClick={() => resetToOriginal(index, 'width')} />
                    </div>
                    <div className="img-input-wrapper">
                        <input
                            type="number"
                            value={asset.height}
                            onChange={(e) => updateAssetSize(index, 'height', e.target.value)}
                            placeholder="Height"
                        />
                        <FontAwesomeIcon icon={faUndoAlt} onClick={() => resetToOriginal(index, 'height')} />
                    </div>
                    <button onClick={() => replaceImage(index)} title="change image">change</button>
                </div>
            ))}
        </div>
    );
}

export default ImagePreview;
