import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import AuthContext from "../../Context/AuthContext";

function SaveDialog({ onClose }) {
    const {user} = useContext(AuthContext);
    const {
        fileName,
        templateData,
        getTemplateLimit,
        remainingUploads,
        saveTemplate
    } = useContext(GlobalStateContext);

    const [message, setMessage] = useState(null);
    const [categories, setCategories] = useState([]);
    const [newCategory, setNewCategory] = useState('');
    const [tagInput, setTagInput] = useState("");

    const [templateName, setTemplateName] = useState(String(templateData?.name || fileName));
    const [templateCategory, setTemplateCategory] = useState(String(templateData?.category || ""));
    const [templateDescription, setTemplateDescription] = useState(String(templateData?.description || ""));
    const [templateTags, setTemplateTags] = useState(templateData?.tags || []);

    useEffect(() => {
        if (user) {
            getTemplateLimit();

            if (user.categories) {
                setCategories(user.categories);
            }
        }
    }, []);

    const showAlert = (msg, duration = 10000) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, duration);
    };

    const handleSaveTemplate = () => {
        const category = newCategory || templateCategory;
        saveTemplate(templateName, category, templateDescription, templateTags);
        showAlert('Template saved successfully.');
        onClose();
    };

    const handleTagKeyDown = (e) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            const trimmedInput = tagInput.trim();
            if (trimmedInput && !templateTags.includes(trimmedInput)) {
                setTemplateTags([...templateTags, trimmedInput]);
            }
            setTagInput("");
        }
    };

    const removeTag = (indexToRemove) => {
        setTemplateTags(templateTags.filter((_, index) => index !== indexToRemove));
    };

    return (
        <>
            <h2>Save to Your StreamShapers account</h2>
            {message && (
                <div className="success-wrapper">
                    <div className="success alert-success">{message}</div>
                </div>
            )}
            <p>{remainingUploads} upload{remainingUploads > 1 ? 's' : ''} left. <a href="#">Upgrade Plan</a></p>

            <div id="save-in-account">
                <div className="row">
                    <span>Name:</span>
                    <input type="text" placeholder="Name..." value={templateName}
                           onChange={(e) => setTemplateName(e.target.value)}/>
                </div>
                <div className="row">
                    <span>Category:</span>
                    {categories.length > 0 ? (
                        <>
                            <select id="category-select" onChange={(e) => setTemplateCategory(e.target.value)} disabled={newCategory !== ''}>
                                <option value={templateCategory}>{templateCategory}</option>
                                {categories.map((cat, index) => (
                                    <option key={index} value={cat}>{cat}</option>
                                ))}
                            </select>
                            <span>or</span>
                        </>
                    ) : (
                        <></>
                    )}
                    <input
                        type="text"
                        placeholder="New Category"
                        id="category"
                        value={newCategory}
                        onChange={(e) => setNewCategory(e.target.value)}/>
                </div>
                <div className="row">
                    <span>Description:</span>
                    <textarea value={templateDescription} placeholder="Template description..."
                              onChange={(e) => setTemplateDescription(e.target.value)}></textarea>
                </div>
                <div className="row">
                    <span>Tags:</span>
                    <div className="tags-input-container">
                        {templateTags.map((tag, index) => (
                            <div key={index} className="tag">
                                {tag}
                                <span className="remove-tag" onClick={() => removeTag(index)}>×</span>
                            </div>
                        ))}
                        <input
                            className="tag-input"
                            type="text"
                            placeholder="Add tags (comma separated)"
                            value={tagInput}
                            onChange={(e) => setTagInput(e.target.value)}
                            onKeyDown={handleTagKeyDown}
                        />
                    </div>
                </div>
            </div>
            <div className="popupButtonArea">
                <button id="downloadBtn" onClick={handleSaveTemplate}>Save</button>
            </div>
        </>

    );
}

export default SaveDialog;