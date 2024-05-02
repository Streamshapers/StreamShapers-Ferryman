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

                if (e.target.name === 'ftype' && e.target.value === 'filelist' && (!field.assetfolder || !field.extension)) {
                    updatedField.assetfolder = field.assetfolder || "";
                    updatedField.extension = field.extension || "";
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
    //TODO: Tooltips für label
    return (
        <div className="tab-content">
            <div className="export-checkbox spx-header">
                <div className="spx-checkbox">
                    <input type="checkbox" id="spx-compatible" checked={spxExport} onChange={handleCheckboxChange}/>
                    <label htmlFor="spx-compatible">Export SPX compatible</label>
                </div>
                <a href="https://www.spx.graphics/" target="_blank">
                    <img id="spx-logo" src="./SPX_logo.png" alt=""/>
                </a>
            </div>
            {spxExport &&
                <div className="spx-settings">
                    {SPXGCTemplateDefinition.DataFields.map((field, index) => (
                        <div key={index} className="spx-setting">
                            <div className="spx-setting-header">
                                <div id="spx-item-key"><p>{field.field}</p></div>
                                <div className="spx-export-right">
                                    {field.ftype !== 'filelist' && (
                                        <label>
                                            fieldtype
                                            <select name="ftype" value={field.ftype}
                                                    onChange={e => handleChange(index, e)}>
                                                <option value="textfield">Text Field</option>
                                                <option value="dropdown">Dropdown</option>
                                                <option value="textarea">Textarea</option>
                                                <option value="checkbox">Checkbox</option>
                                            </select>
                                        </label>
                                    )}
                                    <label>
                                        title
                                        <input type="text" name="title" value={field.title}
                                               onChange={e => handleChange(index, e)}/>
                                    </label>
                                    <label>
                                        value
                                        {field.ftype !== 'checkbox' && (
                                            <input type="text" name="value" value={field.value}
                                                   onChange={e => handleChange(index, e)}/>
                                        )}
                                        {field.ftype === 'checkbox' && (
                                            <select name="value" value={field.value}
                                                    onChange={e => handleChange(index, e)}>
                                                <option value="0">0</option>
                                                <option value="1">1</option>
                                            </select>
                                        )}
                                    </label>
                                    {field.ftype === 'filelist' && (
                                        <label>
                                            assetfolder
                                            <input type="text" name="assetfolder" placeholder="Asset Folder Path"
                                                   value={field.assetfolder} onChange={e => handleChange(index, e)}/>
                                        </label>
                                    )}
                                    {field.ftype === 'filelist' && (
                                        <label>
                                            extension
                                            <input type="text" name="extension" placeholder="File Extension"
                                                   id="spx-export-filetype-input"
                                                   value={field.extension} onChange={e => handleChange(index, e)}/>
                                        </label>
                                    )}
                                </div>
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
