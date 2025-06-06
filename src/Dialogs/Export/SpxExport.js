import React, {useContext, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPlus} from "@fortawesome/free-solid-svg-icons";

function SpxExport() {
    const {
        spxExport,
        SPXGCTemplateDefinition,
        setSPXGCTemplateDefinition,
    } = useContext(GlobalStateContext);
    const [uiColor, setUiColor] = useState("gra");
    const spxUiColors = ["gra", "red", "ora", "gre", "blu", "pin", "vio", "bla"]
    const templateDescription = SPXGCTemplateDefinition.description;

    /*function handleCheckboxChange(event) {
        setSpxExport(event.target.checked);
    }*/

    const handleUiColorChange = (color) => {
        setUiColor(color);
        const spxJson = {...SPXGCTemplateDefinition};
        spxJson.uicolor = spxUiColors.indexOf(color);
        setSPXGCTemplateDefinition(spxJson);
    }

    const handleDescriptionChange = (event) => {
        const spxJson = {...SPXGCTemplateDefinition};
        spxJson.description = event.target.value;
        setSPXGCTemplateDefinition(spxJson);
    }


    const handleInstructionChange = (event) => {
        const { value } = event.target;
        const newFields = [...SPXGCTemplateDefinition.DataFields];
        const instructionIndex = newFields.findIndex(field => field.ftype === "instruction");
        const newInstruction = { ftype: "instruction", value: value };

        if (value.trim()) {
            if (instructionIndex !== -1) {
                newFields[instructionIndex] = newInstruction;
                if (instructionIndex !== 0) {
                    newFields.splice(instructionIndex, 1);
                    newFields.unshift(newInstruction);
                }
            } else {
                newFields.unshift(newInstruction);
            }
        } else if (instructionIndex !== -1) {
            newFields.splice(instructionIndex, 1);
        }

        setSPXGCTemplateDefinition({ ...SPXGCTemplateDefinition, DataFields: newFields });
        //console.log(SPXGCTemplateDefinition);
    };

    const RadioButton = ({label, value, onChange}) => {
        return (
            <label className="spx-radiobutton">
                <input type="radio" checked={value} onChange={onChange}/>
                <span className={label}></span>
            </label>
        );
    };

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

    function handleLayerChange(value) {
        const spxJson = {...SPXGCTemplateDefinition};
        spxJson.webplayout = value;
        setSPXGCTemplateDefinition(spxJson);
    }

    return (
        <div className="tab-content">
            <div className="export-checkbox spx-header">
                <h3>SPX Export Settings</h3>
                {/*<div className="spx-checkbox">
                    <input type="checkbox" id="spx-compatible" checked={spxExport} onChange={handleCheckboxChange}/>
                    <label htmlFor="spx-compatible">Export SPX compatible</label>
                </div>*/}
                <a href="https://www.spx.graphics/" target="_blank" rel="noreferrer">
                    <img id="spx-logo" src="./SPX_logo.png" alt=""/>
                </a>
            </div>
            {spxExport &&
                <div className="spx-settings">
                    <div className="spx-description spx-setting-header">
                        <div id="spx-item-key"><p>Description</p></div>
                        <div className="spx-export-right">
                            <input type="text" placeholder="Title of your template..."
                                   value={SPXGCTemplateDefinition.description}
                                   onChange={e => handleDescriptionChange(e)}>
                            </input>
                        </div>
                    </div>
                    <div className="spx-instruction spx-setting-header">
                        <div id="spx-item-key"><p>Instruction</p></div>
                        <div className="spx-export-right">
                            <textarea placeholder="If you want, put instructions for your template here..."
                                      value={SPXGCTemplateDefinition.DataFields.find(field => field.ftype === "instruction")?.value || ""}
                                      onChange={handleInstructionChange}>
                            </textarea>
                        </div>
                    </div>
                    <div className="spx-uicolor spx-setting-header">
                        <div id="spx-item-key"><p>UI-Color</p></div>
                        <div className="spx-export-right">
                            {
                                spxUiColors.map((color, index) => (
                                    <RadioButton key={index} value={uiColor === color} label={color}
                                                 onChange={() => handleUiColorChange(color)}/>
                                ))
                            }
                        </div>
                    </div>
                    <div className="spx-instruction spx-setting-header">
                        <div id="spx-item-key"><p>SPX-Layer</p></div>
                        <div className="spx-export-right">
                            <select defaultValue={SPXGCTemplateDefinition.webplayout} onChange={(e) => handleLayerChange(e.target.value)}>
                                <option value="-">-</option>
                                {Array.from({length: 20}, (_, i) => (
                                    <option key={i + 1} value={i + 1}>
                                        {i + 1}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {exportFormat !== 'ograf' &&(
                        <>
                            <hr/>
                            {SPXGCTemplateDefinition.DataFields.map((field, index) => (
                                field.ftype !== "instruction" && (
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
                                                            {/*<option value="color">Color</option>*/}
                                                        </select>
                                                    </label>
                                                )}
                                                <label>
                                                    title
                                                    <input type="text" name="title" value={field.title}
                                                           title="Title to identify field in SPX"
                                                           onChange={e => handleChange(index, e)}/>
                                                </label>
                                                <label>
                                                    value
                                                    {field.ftype !== 'checkbox' && (
                                                        <input type="text" name="value" value={field.value}
                                                               title="Initial value of your field"
                                                               onChange={e => handleChange(index, e)}/>
                                                    )}
                                                    {field.ftype === 'checkbox' && (
                                                        <select name="value" value={field.value}
                                                                title="Initial value of your checkbox"
                                                                onChange={e => handleChange(index, e)}>
                                                            <option value="0">0</option>
                                                            <option value="1">1</option>
                                                        </select>
                                                    )}
                                                </label>
                                                {field.ftype === 'filelist' && (
                                                    <label>
                                                        assetfolder
                                                        <input type="text" name="assetfolder"
                                                               placeholder="Asset Folder Path"
                                                               title="Path to your image folder"
                                                               value={field.assetfolder}
                                                               onChange={e => handleChange(index, e)}/>
                                                    </label>
                                                )}
                                                {field.ftype === 'filelist' && (
                                                    <label id="spx-export-filetype-input">
                                                        extension
                                                        <input type="text" name="extension" placeholder="File Extension"
                                                               title="File Extension"
                                                               value={field.extension}
                                                               onChange={e => handleChange(index, e)}/>
                                                    </label>
                                                )}
                                            </div>
                                        </div>
                                        {field.ftype === 'dropdown' && field.items && (
                                            <div className="dropdown-settings spx-extra-settings">
                                                {field.items.map((item, itemIndex) => (
                                                    <div key={itemIndex} className="dropdown-item">
                                                        <input type="text" name="text" placeholder="Item Text"
                                                               value={item.text}
                                                               onChange={e => handleItemChange(index, itemIndex, e)}/>
                                                        <input type="text" name="value" placeholder="Item Value"
                                                               value={item.value}
                                                               onChange={e => handleItemChange(index, itemIndex, e)}/>
                                                        <button onClick={() => removeItem(index, itemIndex)}>Remove</button>
                                                    </div>
                                                ))}
                                                <button onClick={() => addItem(index)} className="add-button">
                                                    <FontAwesomeIcon icon={faPlus} title="Export"/>
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )

                            ))}
                        </>
                )}
                </div>
            }
        </div>
    );
}

export default SpxExport;
