import React, {useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";

function CasparCGTemplateDemo() {
    const {htmlTemplate, textObjects, updateGoogle, setUpdateGoogle} = useContext(GlobalStateContext);
    const templateRef = useRef(null);
    const [clickedPlay, setClickedPlay] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const previewTemplate = useRef(htmlTemplate);
    const [templateReady, setTemplateReady] = useState(false);

    useEffect(() => {

    }, []);

    const triggerAction = (action) => {
        let iframe = templateRef.current;
        if (iframe && iframe.contentWindow) {
            let timeout;
            if (action === "play") {
                timeout = setTimeout(() => {
                    iframe = templateRef.current;
                    iframe.contentWindow.postMessage({ action }, '*');
                    setClickedPlay(true);
                }, 200);
            } else if (action === "stop") {
                setClickedPlay(false);
                iframe.contentWindow.postMessage({ action }, '*');
            } else if (action === "next") {
                if (clickedPlay) {
                    iframe.contentWindow.postMessage({ action }, '*');
                }
            } else {
                iframe.contentWindow.postMessage({ action }, '*');
            }
            return () => clearTimeout(timeout);
        } else {
            console.error('iframe not ready or contentWindow not accessible');
        }
    };

    const updateAction = async () => {
        if (!updateGoogle) setUpdateGoogle(true);

        const iframe = templateRef.current;
        let data = {};
        for (const object of textObjects) {
            data[object.layername] = object.text;
        }

        if (iframe && iframe.contentWindow) {
            //console.log('Sending update message with data:', JSON.stringify(data));
            iframe.contentWindow.postMessage({
                action: "update",
                data: JSON.stringify(data)
            }, '*');
        } else {
            console.error('iframe not ready or contentWindow not accessible');
        }
    }

    return (
        <div className="caspar-player">
            <iframe
                key={iframeKey}
                ref={templateRef}
                srcDoc={previewTemplate.current}
                title="CasparCG Template Preview"
                onLoad={() => {
                    setTemplateReady(true);
                }}
            ></iframe>

            <div id="previewControlContainer" className="just-buttons">
                <div id="previewControls" className="just-buttons">
                    <div className="previewControlButton demo" title="Play" onClick={() => triggerAction('play')}>
                        Play
                    </div>
                    <div className={`previewControlButton demo ${clickedPlay ? 'blue' : 'grey'}`} title="Next"
                         onClick={() => triggerAction('next')}>
                        Next
                    </div>
                    <div className="previewControlButton demo" title="Update"
                         onClick={() => updateAction()}>
                        Update
                    </div>
                    <div className="previewControlButton demo" title="Stop" onClick={() => triggerAction('stop')}>
                        Stop
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CasparCGTemplateDemo;
