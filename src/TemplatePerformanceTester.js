import React, { useContext, useEffect, useRef } from "react";
import { GlobalStateContext } from "./Context/GlobalStateContext";

function TemplatePerformanceTester() {
    const { htmlTemplate, setPerformance, performance } = useContext(GlobalStateContext);
    const iframeRef = useRef();

    useEffect(() => {
        if (!performance) return;

        const handlePerfMessage = (event) => {
            console.log("Message event:", event.data);

            if (event.data?.type === "ferryman-perf") {
                setPerformance(event.data);
                console.log("Message event perf:", performance);
            }
        };
        window.addEventListener('message', handlePerfMessage);

        if (iframeRef.current) {
            iframeRef.current.srcdoc = htmlTemplate;
        }

        return () => window.removeEventListener('message', handlePerfMessage);
    }, [htmlTemplate]);

    return (
        <iframe
            ref={iframeRef}
            style={{ display: "none" }}
            sandbox="allow-scripts"
            title="Template Performance Test"
        />
    );
}

export default TemplatePerformanceTester;
