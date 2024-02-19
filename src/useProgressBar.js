import React, { useEffect, useRef } from 'react';

function useProgressBar(jsonData, lottieInstance) {
    const progressBarRef = useRef(null);
    const markerContainerRef = useRef(null);

    useEffect(() => {
        if (!jsonData || !progressBarRef.current || !markerContainerRef.current) return;

        // Initialisiere ProgressBar und Marker
        const totalFrames = jsonData.op - jsonData.ip;
        const updateProgressBar = (currentFrame) => {
            const progressPercentage = (currentFrame / totalFrames) * 100;
            progressBarRef.current.style.width = `${progressPercentage}%`;
        };

        const updateMarkers = () => {
            const markersHtml = jsonData.markers.map((marker, index) =>
                `<div class="progress-bar-marker" style="left: ${(marker.tm / jsonData.op) * 100}%"
                    onclick="goToMarker(${marker.tm})">
                    <span class="marker-tooltip">${marker.cm}</span>
                </div>`).join('');

            markerContainerRef.current.innerHTML = markersHtml;
        };

        updateMarkers();

        if (lottieInstance) {
            lottieInstance.addEventListener('enterFrame', (e) => {
                updateProgressBar(Math.round(e.currentTime));
            });
        }

        // Cleanup
        return () => {
            if (lottieInstance) {
                lottieInstance.removeEventListener('enterFrame');
            }
        };
    }, [jsonData, lottieInstance]);

    return { progressBarRef, markerContainerRef };
}

function LottiePreview({ jsonData, lottieInstance }) {
    const { progressBarRef, markerContainerRef } = useProgressBar(jsonData, lottieInstance);

    return (
        <div id="progressBarContainer">
            <div id="progressBar" ref={progressBarRef}></div>
            <div id="markerContainer" ref={markerContainerRef}></div>
        </div>
    );
}
