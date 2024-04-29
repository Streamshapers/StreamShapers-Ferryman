import React, {useContext} from "react";
import {GlobalStateContext} from "../GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

function SpxExport() {
    const {
        spxExport,
        setSpxExport,
        SPXGCTemplateDefinition,
        setSPXGCTemplateDefinition,
        refImages
    } = useContext(GlobalStateContext);

    function handleCheckboxChange(event) {
        setSpxExport(event.target.checked);
    }

    const handleChange = (index, e) => {
        const newFields = SPXGCTemplateDefinition.DataFields.map((field, i) => {
            if (i === index) {
                const updatedField = {...field, [e.target.name]: e.target.value};

                if (e.target.name === 'ftype' && e.target.value === 'dropdown' && !field.items) {
                    updatedField.items = [{text: "", value: ""}];
                }

                return updatedField;
            }
            return field;
        });
        setSPXGCTemplateDefinition({...SPXGCTemplateDefinition, DataFields: newFields});
    };


    const handleItemChange = (fieldIndex, itemIndex, e) => {
        const newFields = SPXGCTemplateDefinition.DataFields.map((field, index) => {
            if (index === fieldIndex && field.items) {
                const newItems = field.items.map((item, idx) => {
                    if (idx === itemIndex) {
                        return {...item, [e.target.name]: e.target.value};
                    }
                    return item;
                });
                return {...field, items: newItems};
            }
            return field;
        });
        setSPXGCTemplateDefinition({...SPXGCTemplateDefinition, DataFields: newFields});
    };

    const addItem = (fieldIndex) => {
        const newFields = SPXGCTemplateDefinition.DataFields.map((field, index) => {
            if (index === fieldIndex) {
                const newItems = [...field.items, {text: "", value: ""}];
                return {...field, items: newItems};
            }
            return field;
        });
        setSPXGCTemplateDefinition({...SPXGCTemplateDefinition, DataFields: newFields});
    };

    const removeItem = (fieldIndex, itemIndex) => {
        const newFields = SPXGCTemplateDefinition.DataFields.map((field, index) => {
            if (index === fieldIndex && field.items && field.items.length > 1) {
                const filteredItems = field.items.filter((_, idx) => idx !== itemIndex);
                return {...field, items: filteredItems};
            }
            return field;
        });
        setSPXGCTemplateDefinition({...SPXGCTemplateDefinition, DataFields: newFields});
    };

    return (
        <div className="tab-content">
            <div className="export-checkbox">
                <input type="checkbox" id="spx-compatible" checked={spxExport} onChange={handleCheckboxChange}/>
                <label htmlFor="spx-compatible">Export SPX compatible</label>
            </div>
            {spxExport &&
                <div className="spx-settings">
                    {SPXGCTemplateDefinition.DataFields.map((field, index) => (
                        <div key={index} className="spx-setting">
                            <div className="spx-setting-header">
                                <div id="spx-item-key">{field.field}</div>
                                {field.ftype !== 'filelist' && (
                                    <select name="ftype" value={field.ftype} onChange={e => handleChange(index, e)}>
                                        <option value="textfield">Text Field</option>
                                        <option value="dropdown">Dropdown</option>
                                        <option value="textarea">Textarea</option>
                                        <option value="checkbox">Checkbox</option>
                                    </select>)}
                                <input type="text" name="title" value={field.title}
                                       onChange={e => handleChange(index, e)}/>
                                <input type="text" name="value" value={field.value}
                                       onChange={e => handleChange(index, e)}/>
                                {field.ftype === 'filelist' && (
                                    <input type="text" name="assetfolder" placeholder="Asset Folder Path"
                                           value={field.assetfolder} onChange={e => handleChange(index, e)}/>
                                )}
                                {field.ftype === 'filelist' && (
                                    <input type="text" name="extension" placeholder="File Extension"
                                           value={field.extension} onChange={e => handleChange(index, e)}/>
                                )}
                            </div>
                            {field.ftype === 'dropdown' && field.items && (
                                <div className="dropdown-settings spx-extra-settings">
                                    {field.items.map((item, itemIndex) => (
                                        <div key={itemIndex} className="dropdown-item">
                                            <input type="text" name="text" placeholder="Item Text" value={item.text}
                                                   onChange={e => handleItemChange(index, itemIndex, e)}/>
                                            <input type="text" name="value" placeholder="Item Value" value={item.value}
                                                   onChange={e => handleItemChange(index, itemIndex, e)}/>
                                            <button onClick={() => removeItem(index, itemIndex)}>Remove</button>
                                        </div>
                                    ))}
                                    <button onClick={() => addItem(index)} className="spx-export-button">
                                        <FontAwesomeIcon icon={faPlus} title="Export"/>
                                    </button>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            }
        </div>
    );
}

export default SpxExport;
