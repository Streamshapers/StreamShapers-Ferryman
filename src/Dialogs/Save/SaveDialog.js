import React, {useContext, useEffect, useState} from "react";
import {GlobalStateContext} from "../../Context/GlobalStateContext";
import AuthContext from "../../Context/AuthContext";
import api from "../../axiosInstance";

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
    const [serverError, setServerError] = useState('');
    const [tagInput, setTagInput] = useState("");

    const [templateName, setTemplateName] = useState(String(templateData?.name || fileName));
    const [templateDescription, setTemplateDescription] = useState(String(templateData?.description || ""));
    const [templateTags, setTemplateTags] = useState(templateData?.tags || []);

    const [projects, setProjects] = useState([]);
    const [selectedProjectId, setSelectedProjectId] = useState(templateData?.projectId || "");


    useEffect(() => {
        if (user) {
            getTemplateLimit();
            api.get('/projects')
                .then(res => setProjects(res.data))
                .catch(() => setProjects([]));
        }
    }, []);

    const showAlert = (msg, duration = 10000) => {
        setMessage(msg);
        setTimeout(() => {
            setMessage(null);
        }, duration);
    };

    const handleSaveTemplate = async () => {
        try {
            const saveMsg = await saveTemplate(
                templateName,
                selectedProjectId || null,
                templateDescription,
                templateTags
            );

            if (saveMsg.status === 200 || saveMsg.status === 201) {
                showAlert('Template saved successfully.');
            } else {
                setServerError('Unexpected server response.');
            }
        } catch (error) {
            if (error.response) {
                const msg = error.response.data?.error;
                if (error.response.status === 403) {
                    if (msg === 'Template upload limit reached.') {
                        setServerError('You have reached the template upload limit.');
                    } else {
                        setServerError(msg || 'Access denied.');
                    }
                } else if (error.response.status === 404) {
                    setServerError('Endpoint not found. Please contact support.');
                } else if (error.response.status === 413) {
                    setServerError('Your Template is too large. (Limit: 5MB)');
                } else {
                    setServerError(`Unexpected error: ${error.response.status}`);
                }
            } else {
                setServerError('No server response. Check your connection.');
            }
        }
    }


    const handleTagKeyDown = (e) => {
        if (e.key === "," || e.key === "Enter") {
            e.preventDefault();
            const trimmedInput = tagInput.trim();
            if (trimmedInput && !templateTags.includes(trimmedInput)) {
                setTemplateTags([...templateTags, trimmedInput]);
            }
            setTagInput("");
        }
    }

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
            {serverError && <p style={{ color: 'red', marginBottom: '1rem' }}>{serverError}</p>}
            <p>{remainingUploads} upload{remainingUploads > 1 ? 's' : ''} left. <a href="https://streamshapers.com/plans"><span className="upgrade-plan">Upgrade Plan</span></a></p>

            <div id="save-in-account">
                <div className="row">
                    <span>Name:</span>
                    <input
                        type="text"
                        placeholder="Name..."
                        value={templateName}
                        onChange={(e) => setTemplateName(e.target.value)}
                    />
                </div>
                <div className="row">
                    <span>Project:</span>
                    <select
                        value={selectedProjectId}
                        onChange={e => setSelectedProjectId(e.target.value)}
                    >
                        <option value="">No project</option>
                        {projects.map(project => (
                            <option key={project._id} value={project._id}>
                                {project.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div className="row">
                    <span>Description:</span>
                    <textarea
                        value={templateDescription}
                        placeholder="Template description..."
                        onChange={(e) => setTemplateDescription(e.target.value)}
                    ></textarea>
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
                <button id='downloadBtn' onClick={handleSaveTemplate}>Save</button>
            </div>
        </>
    );
}

export default SaveDialog;
