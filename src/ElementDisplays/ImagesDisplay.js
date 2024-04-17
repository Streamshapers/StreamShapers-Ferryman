import React, {useContext, useState} from 'react';
import {GlobalStateContext} from '../GlobalStateContext';

function ImagePreview() {
    const {jsonData, setJsonData, refImages, setImagePath, imagePath} = useContext(GlobalStateContext);
    const [imageAssets, setImageAssets] = useState([]);
    const [imagesShowAll, setImagesShowAll] = useState(false);

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

    const replaceImage = async (id) => {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = 'image/*';
        fileInput.onchange = async (e) => {
            const file = e.target.files[0];
            if (file) {
                const base64 = await convertToBase64(file);
                const updatedJsonData = {...jsonData};
                const assetToUpdate = updatedJsonData.assets.find(asset => asset.id === id);
                if (assetToUpdate) {
                    assetToUpdate.p = base64;
                    setJsonData(updatedJsonData);
                }
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

    const toggleImagesShowAll = () => {
        setImagesShowAll(!imagesShowAll);
    };

    function getImage(id) {
        const asset = jsonData.assets.find(asset => asset.id === id);

        return asset.p || null;
    }

    function changeImageLayerName(refId, newLayerName) {
        let updatedJsonData = {...jsonData};

        const layerToChange = updatedJsonData.layers.find(layer => layer.refId === refId);

        if (layerToChange) {
            layerToChange.nm = newLayerName;
        }

        setJsonData(updatedJsonData);
    }

    const filteredImageAssets = imagesShowAll
        ? refImages
        : refImages.filter(asset => asset.nm.startsWith('_'));

    function changeImagePath(path){
        setImagePath(path);
    }

    return (
        <>
            <div className="controls">
                <div className="control-item">
                    <label htmlFor="textShowAll">Show All</label>
                    <input
                        type="checkbox"
                        title="Show all"
                        id="textShowAll"
                        checked={imagesShowAll}
                        onChange={toggleImagesShowAll}
                    />
                </div>
                <div className="control-item">
                    <input
                        type="text"
                        value={imagePath}
                        onChange={(e) => changeImagePath(e.target.value)}
                        placeholder="imagePath"
                    />
                </div>
            </div>
            <div id="image-preview">
                {filteredImageAssets.map((asset, index) => (
                    <div key={asset.refId} className="image-preview-wrapper">
                        <img className='imgPreview' src={getImage(asset.refId)} alt={`Preview ${index}`}/>
                        <div className="img-input-wrapper">
                            <input
                                type="text"
                                value={asset.nm}
                                onChange={(e) => changeImageLayerName(asset.refId, e.target.value)}
                                placeholder="Layer name"
                            />
                            <i>{jsonData.assets.find(img => img.id === asset.refId).w}px x{jsonData.assets.find(img => img.id === asset.refId).h}px</i>
                        </div>

                        <button onClick={() => replaceImage(asset.refId)} title="change image">change</button>
                    </div>
                ))}
            </div>
        </>
    );
}

export default ImagePreview;
