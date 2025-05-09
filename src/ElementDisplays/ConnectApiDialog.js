import React, {useContext, useState} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus, faRotateRight, faXmark} from "@fortawesome/free-solid-svg-icons";

function ConnectApiDialog() {
    const {
        useExternalSources,
        externalSources,
        setExternalSources,
        setDeleteExternalSource,
        setUpdateGoogle
    } = useContext(GlobalStateContext);
    const [externalSourceIndex, setExternalSourceIndex] = useState(2)

    const handleAddApi = () => {
        setExternalSources([...externalSources, {
            key: 'Google Sheet',
            secret: '',
            index: externalSourceIndex,
            errors: ''
        }]);
        setExternalSourceIndex(externalSourceIndex + 1);
    };

    const handleChange = (index, field, value) => {
        const newApis = externalSources.map((api, idx) => {
            if (idx === index) {
                if (field === "key" && value === "Digital Clock") {
                    const newSecret = api.secret === "" ? "24h hh:mm:ss" : api.secret;
                    return {...api, [field]: value, secret: newSecret};
                } else if (field === "secret" && api.key === "Google Sheet") {
                    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
                    const match = value.match(regex);
                    let error = match ? '' : 'invalid source';
                    let finalValue = match ? match[1] : value;
                    return { ...api, [field]: finalValue, errors: error };
                } else if (field === "secret" && api.key === "Digital Clock") {
                    return {...api, [field]: value};
                } else {
                    return { ...api, [field]: value };
                }
            }
            return api;
        });
        setExternalSources(newApis);
        //console.log("Aktualisierte Quellen:", newApis);

    };

    const handleRemoveApi = index => {
        const source = externalSources[index].index;
        setDeleteExternalSource(source);
        const newApis = externalSources.filter((_, idx) => idx !== index);
        setExternalSources(newApis);
    };

    const handleSourceUpdate = () => {
        setUpdateGoogle(true);
    }

    return (
        <>
            {useExternalSources && (
                <div className='api-dialog-wrapper'>
                    <div className="external-sources-header">
                        <div className="sources-placeholder"></div>
                        <h4>Sources</h4>
                        <div className="div-button" title="refresh sources" onClick={() => handleSourceUpdate()}>
                            <FontAwesomeIcon icon={faRotateRight}/>
                        </div>
                    </div>
                    {externalSources.map((api, index) => (
                        <div className="api-wrapper" key={api.index}>
                            {api.errors === 'invalid source' && (
                                <div key={api.index} className="textError">
                                    <p>
                                        <b>Invalid Source:</b> - Please make sure to use a valid GoogleSheets URL!</p>
                                </div>
                            )}
                        <div className="api-dialog" key={index}>
                            <div>{api.index.toString() + "."}</div>
                            <select value={api.key} onChange={e => handleChange(index, 'key', e.target.value)}>
                                <option>Google Sheet</option>
                                <option>Digital Clock</option>
                            </select>
                            <div className="external-source-fields">
                                {api.key === "Google Sheet" && (
                                    <input
                                        type="text"
                                        value={api.secret}
                                        onChange={e => handleChange(index, 'secret', e.target.value)}
                                        placeholder="put your spreadsheet url here..."/>
                                )}
                                {api.key === "Digital Clock" && (
                                    <div className="external-source-clock">
                                        <div>Format:</div>
                                        <select onChange={e => handleChange(index, 'secret', e.target.value)}>
                                            <option>24h hh:mm:ss</option>
                                            <option>24h hh:mm</option>
                                            <option>12h hh:mm:ss am/pm</option>
                                            <option>12h hh:mm am/pm</option>
                                            <option>12h hh:mm:ss</option>
                                            <option>12h hh:mm</option>
                                        </select>
                                    </div>
                                )}

                                    <div className="div-button remove-button" onClick={() => handleRemoveApi(index)}>
                                        <FontAwesomeIcon icon={faXmark}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="div-button add-button" title="Add External Source" onClick={handleAddApi}>
                        <FontAwesomeIcon icon={faPlus}/>
                    </div>
                </div>
            )}
        </>
    );
}

export default ConnectApiDialog;
