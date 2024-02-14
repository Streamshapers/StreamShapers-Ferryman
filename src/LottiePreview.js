import React, { useState, useEffect, useRef, useContext } from 'react';
import { GlobalStateContext } from "./GlobalStateContext";
import lottie from 'lottie-web';

function LottiePreview() {
    const { jsonData } = useContext(GlobalStateContext);
    const animationContainerRef = useRef(null);
    const progressBarRef = useRef(null);
    const [lottieInstance, setLottieInstance] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [markers, setMarkers] = useState([]);

    useEffect(() => {
        const instance = lottie.loadAnimation({
            container: animationContainerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: false,
            animationData: jsonData,
        });

        const onEnterFrame = (e) => {
            setCurrentFrame(Math.round(e.currentTime));
            const progress = e.currentTime / (jsonData.op - jsonData.ip);
            if (progressBarRef.current) {
                progressBarRef.current.style.width = `${progress * 100}%`;
            }
        };

        instance.addEventListener('enterFrame', onEnterFrame);

        setLottieInstance(instance);
        setMarkers(jsonData.markers || []);

        return () => {
            instance.removeEventListener('enterFrame', onEnterFrame);
            instance.destroy();
        };
    }, [jsonData]);

    const togglePlayPause = () => {
        if (!lottieInstance) return;
        const newState = !isPlaying;
        setIsPlaying(newState);

        newState ? lottieInstance.play() : lottieInstance.pause();
    };

    const stepFrame = (direction) => {
        if (!lottieInstance) return;
        const newFrame = Math.max(0, Math.min(currentFrame + direction, jsonData.op - 1));
        lottieInstance.goToAndStop(newFrame, true);
        setCurrentFrame(newFrame);
    };

    const goToNextMarker = () => {
        const nextMarker = markers.find(marker => marker.tm > currentFrame);
        if (nextMarker) {
            lottieInstance.goToAndStop(nextMarker.tm, true);
            setCurrentFrame(nextMarker.tm);
        }
    };

    // Methoden zum Herunterladen des aktuellen Frames müssen noch implementiert werden

    return (
        <div>
            <div ref={animationContainerRef} />

            <div id="previewControls">
                <div>
                    <div id="progressBarContainer">
                        <div ref={progressBarRef} id="progressBar" style={{width: '0%'}}></div>
                    </div>
                    <div>Aktueller Frame: {currentFrame}</div>
                    <button onClick={() => stepFrame(-1)}>Frame zurück</button>
                    <button onClick={togglePlayPause}>
                        {isPlaying ? 'Pause' : 'Play'}
                    </button>
                    <button onClick={() => stepFrame(1)}>Nächster Frame</button>
                    <button onClick={goToNextMarker}>Zum nächsten Marker</button>
                    {/* Button zum Herunterladen des Frames fehlt noch */}
                </div>
            </div>
        </div>
    );
}

export default LottiePreview;
