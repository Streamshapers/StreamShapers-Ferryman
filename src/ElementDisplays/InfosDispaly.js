import React, {useContext} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";

function InfosDisplay() {
    const {infos} = useContext(GlobalStateContext);


    if (!infos) {
        return <div>Loading...</div>;
    }

    const infoElements = Object.entries(infos).map(([key, value]) => (
        <div key={key} className='info-item'>
            <div className='info-name'>{key}:</div>
            <div className='info-value'>{value}</div>
        </div>
    ));

    return (
        <>
            <div className='accordionInfo'>
                {infoElements}
            </div>
        </>
    );
}

export default InfosDisplay;
