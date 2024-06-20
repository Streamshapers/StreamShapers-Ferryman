import React, {useContext} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faXmark} from "@fortawesome/free-solid-svg-icons";

function ConnectApiDialog() {
    const {externalSources, apis, setApis} = useContext(GlobalStateContext);

    const handleAddApi = () => {
        setApis([...apis, {key: '', secret: ''}]);
    };

    const handleChange = (index, field, value) => {
        const newApis = apis.map((api, idx) => {
            if (idx === index) {
                return {...api, [field]: value};
            }
            return api;
        });
        setApis(newApis);
    };

    const handleRemoveApi = index => {
        const newApis = apis.filter((_, idx) => idx !== index);
        setApis(newApis);
    };

    return (
        <>
            {externalSources && (
                <div className='api-dialog-wrapper'>
                    {apis.map((api, index) => (
                        <div className="api-dialog" key={index}>
                            <div>{index.toString() + "."}</div>
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
