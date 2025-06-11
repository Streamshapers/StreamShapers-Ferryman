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
        setUpdateGoogle,
        fetchSourcesPeriodically,
        setFetchSourcesPeriodically,
        sourcesFetchInterval,
        setSourcesFetchInterval
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
                // Wenn der API-Typ geändert wird
                if (field === "key") {
                    let newSecret = '';
                    if (value === "Digital Clock") {
                        newSecret = "24h hh:mm:ss";
                    }
                    return {
                        ...api,
                        key: value,
                        secret: newSecret,
                        errors: ''
                    };
                }

                // Wenn das Secret für Google Sheet geändert wird
                if (field === "secret" && api.key === "Google Sheet") {
                    const regex = /\/d\/([a-zA-Z0-9-_]+)/;
                    const match = value.match(regex);
                    const error = match ? '' : 'invalid source';
                    const finalValue = match ? match[1] : value;
                    return {...api, secret: finalValue, errors: error};
                }

                // Wenn das Secret für Digital Clock geändert wird
                if (field === "secret" && api.key === "Digital Clock") {
                    return {...api, secret: value};
                }

                // Default-Fall für alle anderen Änderungen
                return {...api, [field]: value};
            }

            return api;
        });

        setExternalSources(newApis);
    }


    const handleRemoveApi = index => {
        const source = externalSources[index].index;
        setDeleteExternalSource(source);
        const newApis = externalSources.filter((_, idx) => idx !== index);
        setExternalSources(newApis);
    };

    const handleSourceUpdate = () => {
        setUpdateGoogle(true);
    }

    const toggleFetchPeriodically = () => {
        setFetchSourcesPeriodically(!fetchSourcesPeriodically);
    }

    const setNewFetchInterval = (value) => {
        const seconds = parseInt(value, 10);

        if (isNaN(seconds) || seconds <= 0) {
            return;
        }

        setSourcesFetchInterval(seconds * 1000);
    };


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

                    <div className="external-sources-fetch-control">
                        <div className="source-fetch-item">
                            <label htmlFor="api-dialog-fetch-p">Fetch Periodically</label>
                            <input
                                type="checkbox"
                                title="Fetch Periodically"
                                id="api-dialog-fetch-p"
                                checked={fetchSourcesPeriodically}
                                onChange={toggleFetchPeriodically}
                            />
                        </div>
                        {fetchSourcesPeriodically && (
                            <>
                                <p>Fetch every</p>
                                <input
                                    className="source-fetch-item"
                                    type="number"
                                    min="1"
                                    step="1"
                                    title="Fetch Interval"
                                    value={sourcesFetchInterval / 1000}
                                    onChange={e => setNewFetchInterval(e.target.value)}
                                />
                                <p>seconds</p>
                            </>
                        )}
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
                                <div className="api-dialog-content">
                                    <select className="api-select" value={api.key}
                                            onChange={e => handleChange(index, 'key', e.target.value)}>
                                        <option>Google Sheet</option>
                                        <option>Digital Clock</option>
                                    </select>
                                    <div className="external-source-fields">
                                        {api.key === "Google Sheet" && (
                                            <input
                                                type="text"
                                                value={api.secret}
                                                onChange={e => handleChange(index, 'secret', e.target.value)}
                                                placeholder="put your spreadsheet url here..."
                                            />
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
                                    </div>
                                </div>
                                <div className="div-button remove-button"
                                     onClick={() => handleRemoveApi(index)}>
                                    <FontAwesomeIcon icon={faXmark}/>
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
