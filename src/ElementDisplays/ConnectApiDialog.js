import React, {useContext} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

function ConnectApiDialog() {
    const {showApiDialog} = useContext(GlobalStateContext);

    const handleApiChange = (e) => {

    };

    return (
        <div className='api-dialog-wrapper'>
            {showApiDialog && (
                <div className="api-dialog">
                    <select name="value"
                            title="Choose your API"
                            onChange={e => handleApiChange(e)}>
                        <option value="google-table">Google Table</option>
                        <option value="test">Test</option>
                    </select>
                    <input name="api-link" placeholder="put your API link here..."/>
                    <button className="spx-export-button" title="Add API">
                        <FontAwesomeIcon icon={faPlus}/>
                    </button>
                </div>
            )}
        </div>
    );
}

export default ConnectApiDialog;
