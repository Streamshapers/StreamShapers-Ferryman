import React, { useContext } from 'react';
import { GlobalStateContext } from '../GlobalStateContext';

function ImagePreview() {
    const { jsonData, setJsonData } = useContext(GlobalStateContext);

    const handleInputChange = (index, key, value) => {
        const updatedMarkers = [...jsonData.markers];

        if (key === 'endFrame') {
            const startFrame = updatedMarkers[index]['tm'];
            updatedMarkers[index]['dr'] = value - startFrame;
        } else {
            updatedMarkers[index][key] = value;
        }

        setJsonData({ ...jsonData, markers: updatedMarkers });
    };

    return (
        <div className="markers-wrapper">
            {jsonData.markers.map((marker, index) => (
                <div key={index} className="marker-inputs">
                    <label htmlFor={`name-${index}`}>Name:</label>
                    <input
                        id={`name-${index}`}
                        className="marker-input-name"
                        type="text"
                        value={marker.cm}
                        onChange={(e) => handleInputChange(index, 'cm', e.target.value)}
                    />

                    <label htmlFor={`start-${index}`}>Start:</label>
                    <input
                        id={`start-${index}`}
                        className="marker-input-start"
                        type="number"
                        value={marker.tm}
                        onChange={(e) => handleInputChange(index, 'tm', parseInt(e.target.value, 10))}
                    />

                    <label htmlFor={`end-${index}`}>End:</label>
                    <input
                        id={`end-${index}`}
                        className="marker-input-end"
                        type="number"
                        // Hier wird angenommen, dass das Endframe durch Addition von 'tm' und 'dr' berechnet wird
                        value={marker.tm + marker.dr}
                        onChange={(e) => handleInputChange(index, 'endFrame', parseInt(e.target.value, 10))}
                    />
                </div>
            ))}
        </div>
    );
}

export default ImagePreview;
