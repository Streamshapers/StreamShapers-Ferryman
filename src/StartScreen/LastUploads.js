import React, {useContext, useEffect, useRef, useState} from "react";
import {GlobalStateContext} from "../Context/GlobalStateContext";
import AuthContext from "../Context/AuthContext";
import {Player} from '@lottiefiles/react-lottie-player';
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faEllipsisVertical} from "@fortawesome/free-solid-svg-icons";
import api from "../axiosInstance";

function LastUploads() {
    const {user} = useContext(AuthContext);
    const {loadNewFile, setTemplateData} = useContext(GlobalStateContext);
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
                const res = await api.get('/templates/latest', {
                    withCredentials: true
                });
                setTemplates(res.data);
                //console.log(res.data);
            } catch (err) {
                console.error('Error loading templates:', err);
                setError('Error loading templates');
            } finally {
                setLoading(false);
            }
        };

        fetchTemplates();
    }, [user]);

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
        const ref = playerRefs.current[templateId];
        const template = templates.find(t => t._id === templateId);
        const marker = template?.data?.templateJson?.markers?.find(m => m.cm === "start");

        if (marker && ref) {
            const endFrame = marker.tm + marker.dr;
            ref.setSeeker(endFrame);
            ref.pause();
        } else {
            ref.stop();
        }
    };

    const handleDropdownToggle = (templateId) => {
        setShowDropdown(showDropdown === templateId ? null : templateId);
    };

    const handleLoadInFerryman = async (id) => {
        try {
            const res = await api.get('/templates/' + id, {
                withCredentials: true
            });
            const blob = new Blob([JSON.stringify(res.data)], {type: 'application/json'});
            loadNewFile(blob);
        } catch (error) {
            console.error("Error loading file:", error);
        }
    };

    useEffect(() => {
        templates.forEach(template => {
            const ref = playerRefs.current[template._id];
            const marker = template?.data?.templateJson?.markers?.find(m => m.cm === "start");
            if (marker && ref && ref.setSeeker) {
                setTimeout(() => {
                    const endFrame = marker.tm + marker.dr;
                    ref.setSeeker(endFrame);
                    ref.pause();
                }, 300);
            }
        });
    }, [templates]);

    return (
        <>
            {user && (
                <div className="last-uploaded-container">
                    {loading ? (
                        <p>Loading Templates...</p>
                    ) : error ? (
                        <p>{error}</p>
                    ) : templates.length !== 0 ? (
                        <>
                            <h2>Your last edited Templates</h2>
                            <div className="template-grid">
                                {templates
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
                                                            onClick={() => handleLoadInFerryman(template._id)}>Open
                                                            in Ferryman
                                                        </button>

                                                    </div>
                                                )}
                                            </div>
                                            <div className="template-card-body">
                                                <Player
                                                    ref={el => playerRefs.current[template._id] = el}
                                                    src={template.data.templateJson}
                                                    style={{height: 'auto', width: '100%'}}
                                                    loop
                                                />
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </>
                    ) : (
                        <div></div>
                    )}
                </div>
            )}
        </>
    );


}

export default LastUploads;
