import React, {useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faRotateRight} from "@fortawesome/free-solid-svg-icons";

function CasparCGTemplateDemo() {
    const {jsonData, htmlTemplate, textObjects, updateGoogle, setUpdateGoogle, importedHTML} = useContext(GlobalStateContext);
    const templateRef = useRef(null);
    const [clickedPlay, setClickedPlay] = useState(false);
    const [iframeKey, setIframeKey] = useState(0);
    const previewTemplate = useRef(htmlTemplate);

    useEffect(() => {
        if(!jsonData && importedHTML) {
            previewTemplate.current = importedHTML;
        }
    }, [importedHTML]);

    const triggerAction = (action) => {
        const iframe = templateRef.current;
        if (!iframe?.contentWindow) {
            console.error("iframe not ready");
            return;
        }
        switch (action) {
            case "play":
                // erst Daten schicken, dann Play
                //console.log("template", importedHTML);
                if(!clickedPlay) sendUpdateMessage();
                iframe.contentWindow.postMessage({action: "play"}, "*");
                setClickedPlay(true);
                break;

            case "next":
                if (clickedPlay)
                    iframe.contentWindow.postMessage({action: "next"}, "*");
                break;

            case "stop":
                setClickedPlay(false);
                iframe.contentWindow.postMessage({action: "stop"}, "*");
                break;

            case "refresh":
                previewTemplate.current = htmlTemplate;
                setClickedPlay(false);
                setIframeKey(k => k + 1);
                //console.log("refresh")
                break;

            default:
                iframe.contentWindow.postMessage({action}, "*");
        }
    }

    const updateAction = async () => {
        if (!updateGoogle) setUpdateGoogle(true);
        sendUpdateMessage();
    }

    const sendUpdateMessage = () => {
        const iframe = templateRef.current;
        if (!iframe?.contentWindow) return;

        const data = Object.fromEntries(
            textObjects.map((o) => [o.layername, o.text])
        );

        iframe.contentWindow.postMessage(
            {action: "update", data: JSON.stringify(data)},
            "*"
        );
    };

    return (
        <div className="caspar-player">
            <iframe
                key={iframeKey}
                ref={templateRef}
                srcDoc={previewTemplate.current}
                title="CasparCG Template Preview"
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
                    <div className="previewControlButton demo" title="refresh sources"
                         onClick={() => triggerAction('refresh')}>
                        <FontAwesomeIcon icon={faRotateRight}/>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default CasparCGTemplateDemo;
