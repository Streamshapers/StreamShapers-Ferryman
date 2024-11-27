import React, {useContext, useEffect, useRef, useState} from "react";
import {GlobalStateContext} from "../Context/GlobalStateContext";
import AuthContext from "../Context/AuthContext";
import axios from "axios";
import {Player} from '@lottiefiles/react-lottie-player';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";

function LastUploads() {
    const {user, logout} = useContext(AuthContext);
    const {jsonFile, setJsonFile, theme, serverUrl} = useContext(GlobalStateContext);
    const [loading, setLoading] = useState(true);
    const [templates, setTemplates] = useState([]);
    const [error, setError] = useState('');
    const [hoveredTemplateId, setHoveredTemplateId] = useState(null);
    const playerRefs = useRef({});
    const [showDropdown, setShowDropdown] = useState(null);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchTemplates = async () => {
            if (!user) return;
            setLoading(true);
            try {
                const res = await axios.get(serverUrl + '/templates', {
                    withCredentials: true
                });
                setTemplates(res.data);
            } catch (err) {
                console.error('Fehler beim Abrufen der Templates:', err);
                setError('Fehler beim Abrufen der Templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, []);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(null);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    const handleMouseEnter = (templateId) => {
        setHoveredTemplateId(templateId);
        if (playerRefs.current[templateId]) {
            playerRefs.current[templateId].play();
        }
    };

    const handleMouseLeave = (templateId) => {
        setHoveredTemplateId(null);
        if (playerRefs.current[templateId]) {
            playerRefs.current[templateId].pause();
        }
    };

    const handleDropdownToggle = (templateId) => {
        setShowDropdown(showDropdown === templateId ? null : templateId);
    };

    const handleLoadInFerryman = async (path) => {
        try {
            const response = await fetch(path);
            const blob = await response.blob();
            setJsonFile(blob);
        } catch (error) {
            console.error("Error loading file:", error);
        }
    };

    return (
        <>
            {user && (
                <div className="last-uploaded-container">
                    <h2>Your last edited Templates</h2>
                    <div className="template-grid">
                        {loading ? (
                            <p>Loading Templates...</p>
                        ) : error ? (
                            <p>{error}</p>
                        ) : (
                            templates
                                .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
                                .slice(0, 3)
                                .map(template => (
                                    <div
                                        className="template-card"
                                        key={template._id}
                                        onMouseEnter={() => handleMouseEnter(template._id)}
                                        onMouseLeave={() => handleMouseLeave(template._id)}
                                    >
                                        <div className="template-card-header">
                                            <div></div>
                                            <h3>{template.name}</h3>
                                            <FontAwesomeIcon
                                                className="template-card-more"
                                                icon={faEllipsisVertical}
                                                onClick={() => handleDropdownToggle(template._id)}
                                            />
                                            {showDropdown === template._id && (
                                                <div className="template-card-dropdown-menu" ref={dropdownRef}>
                                                    <button
                                                        onClick={() => handleLoadInFerryman(`${serverUrl}/${template.path}`)}>Open
                                                        in Ferryman
                                                    </button>

                                                </div>
                                            )}
                                        </div>
                                        <div className="template-card-body">
                                            <Player
                                                ref={el => playerRefs.current[template._id] = el}
                                                src={`${serverUrl}/${template.path}`}
                                                style={{height: 'auto', width: '100%'}}
                                                loop
                                            />
                                        </div>
                                    </div>
                                ))
                        )}
                    </div>
                </div>
            )}
        </>
    );


}

export default LastUploads;