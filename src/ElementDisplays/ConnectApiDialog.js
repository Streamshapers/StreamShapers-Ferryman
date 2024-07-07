import React, {useContext, useState} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";

function ConnectApiDialog() {
    const {
        useExternalSources,
        externalSources,
        setExternalSources,
        setDeleteExternalSource
    } = useContext(GlobalStateContext);
    const [externalSourceIndex, setExternalSourceIndex] = useState(2)

    const handleAddApi = () => {
        setExternalSources([...externalSources, {key: 'Google Table', secret: '', index: externalSourceIndex}]);
        setExternalSourceIndex(externalSourceIndex + 1);
        //console.log(externalSources);
    };

    const handleChange = (index, field, value) => {
        const newApis = externalSources.map((api, idx) => {
            if (idx === index) {
                return {...api, [field]: value};
            }
            return api;
        });
        setExternalSources(newApis);
        //console.log(externalSources);
    };

    const handleRemoveApi = index => {
        const source = externalSources[index].index;
        setDeleteExternalSource(source);
        const newApis = externalSources.filter((_, idx) => idx !== index);
        setExternalSources(newApis);
    };

    return (
        <>
            {useExternalSources && (
                <div className='api-dialog-wrapper'>
                    {externalSources.map((api, index) => (
                        <div className="api-dialog" key={index}>
                            <div>{api.index.toString() + "."}</div>
                            <select value={api.key} onChange={e => handleChange(index, 'key', e.target.value)}>
                                <option>Google Table</option>
                                <option>CSV</option>
                            </select>
                            <input
                                type="text"
                                onChange={e => handleChange(index, 'secret', e.target.value)}
                                placeholder="put your link here..."
                            />
                            <button className="remove-button" onClick={() => handleRemoveApi(index)}>
                                <FontAwesomeIcon icon={faXmark}/>
                            </button>
                        </div>
                    ))}
                    <button className="add-button" title="Add External Source" onClick={handleAddApi}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </button>
                </div>
            )}
        </>
    );
}

export default ConnectApiDialog;
