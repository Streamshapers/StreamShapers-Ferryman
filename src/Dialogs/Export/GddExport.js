import React, {useContext, useEffect} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";

function GddExport() {
    const {
        GDDTemplateDefinition,
        setGDDTemplateDefinition
    } = useContext(GlobalStateContext);

    useEffect(() => {
        console.log(GDDTemplateDefinition)
    }, [GDDTemplateDefinition]);

    const handleTextChange = (key, field, value) => {
        const updatedProperties = {
            ...GDDTemplateDefinition.properties,
            [key]: {
                ...GDDTemplateDefinition.properties[key],
                [field]: value
            }
        };

        setGDDTemplateDefinition({
            ...GDDTemplateDefinition,
            properties: updatedProperties
        });
    };

    const handleImageChange = (key, field, value) => {
        const updatedProperties = {
            ...GDDTemplateDefinition.properties,
            [key]: {
                ...GDDTemplateDefinition.properties[key],
                gddOptions: {
                    ...GDDTemplateDefinition.properties[key].gddOptions,
                    [field]: value.split(',')
                }
            }
        };

        setGDDTemplateDefinition({
            ...GDDTemplateDefinition,
            properties: updatedProperties
        });
    };

    return (
        <div className="tab-content">
            <div className="export-checkbox gdd-header">
                <h3>GDD Export Settings</h3>
            </div>
            <div className="gdd-settings">
                {Object.entries(GDDTemplateDefinition.properties).map(([key, prop]) => (
                    <div key={key} className="spx-setting">
                        <div className="spx-setting-header">
                            <div id="spx-item-key"><p>{key}</p></div>
                            <div className="spx-export-right">
                                {prop.gddType.includes("image-path") ? (
                                    <>
                                        <label>
                                            Extensions
                                            <input type="text" name="extensions"
                                                   value={prop.gddOptions.extensions.join(',')}
                                                   onChange={(e) => handleImageChange(key, 'extensions', e.target.value)}/>
                                        </label>
                                        <label>
                                            Default Image Path
                                            <input type="text" name="default"
                                                   value={prop.default}
                                                   onChange={(e) => handleImageChange(key, 'default', e.target.value)}/>
                                        </label>
                                    </>
                                ) : (
                                    <>
                                        <label>
                                            Type
                                            <input type="text" name="type" value={prop.type}
                                                   onChange={(e) => handleTextChange(key, 'type', e.target.value)}/>
                                        </label>
                                        <label>
                                            Default Text
                                            <input type="text" name="default" value={prop.default}
                                                   onChange={(e) => handleTextChange(key, 'default', e.target.value)}/>
                                        </label>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

export default GddExport;
