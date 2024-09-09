import React, { useContext, useEffect, useRef } from 'react';
import { GlobalStateContext } from "../GlobalStateContext";

function CasparCGTemplateDemo() {
    const { htmlTemplate, textObjects} = useContext(GlobalStateContext);
    const templateRef = useRef(null);
    const clickedPlayRef = useRef(false);

    const triggerAction = (action) => {
        const iframe = templateRef.current;
        if (iframe && iframe.contentWindow) {
            console.log(`Sending action: ${action}`);
            if (action === "start") {
                clickedPlayRef.current = true;
            } else if (action === "stop") {
                clickedPlayRef.current = false;
            }
            iframe.contentWindow.postMessage({"action": action}, '*');
        } else {
            console.error('iframe not ready or contentWindow not accessible');
        }
    }

    useEffect(() => {
        const delay = 300;
        const timeoutId = setTimeout(() => {
            triggerAction("update");
        }, delay);

        return () => clearTimeout(timeoutId);
    }, [clickedPlayRef]);

    const updateAction = async () => {
        const iframe = templateRef.current;
        let data = {};
        for (const object of textObjects) {
            data[object.layername] = object.text;
        }

        if (iframe && iframe.contentWindow) {
            console.log('Sending update message with data:', JSON.stringify(data));
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
                ref={templateRef}
                srcDoc={htmlTemplate}
                title="CasparCG Template Preview"
            ></iframe>

            <div id="previewControlContainer" className="just-buttons">
                <div id="previewControls" className="just-buttons">
                    <div className="previewControlButton demo" title="Play" onClick={() => triggerAction('play')}>
                        Play
                    </div>
                    <div className={`previewControlButton demo ${clickedPlayRef ? 'blue' : 'grey'}`} title="Next"
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
