import React, {useContext, useState} from "react";
import {GlobalStateContext} from "../GlobalStateContext";

function SpxExport() {
    const {jsonData} = useContext(GlobalStateContext);
    const [isChecked, setIsChecked] = useState(false);

    function handleCheckboxChange(event) {
        setIsChecked(event.target.checked);
    }

    return (
        <div className="tab-content">
            <div className="export-checkbox">
                <input type="checkbox" id="spx-compatible" checked={isChecked} onChange={handleCheckboxChange}/>
                <label for="spx-compatible">Export SPX compatible</label>
            </div>
            {isChecked && <p>true</p>}
        </div>
    )
        ;
}

export default SpxExport;