import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import lottie from 'lottie-web';

const MarkersContainer = React.memo(({markers, goToMarker}) => {
    const {jsonData} = useContext(GlobalStateContext);

    return (
        markers.map((marker, index) => (
            <React.Fragment key={`marker-${marker.tm}`}>
                <div
                    className="progress-bar-marker"
                    style={{
                        left: `${(marker.tm / jsonData.op) * 100}%`,
                    }}
                    onClick={() => goToMarker(marker.tm)}
                >
                    <span className="marker-tooltip">{marker.cm}</span>
                </div>
                <div
                    className="marker-duration"
                    style={{
                        left: `${(marker.tm / jsonData.op) * 100}%`,
                        width: `${(marker.dr / jsonData.op) * 100}%`,
                    }}
                ></div>
            </React.Fragment>
        ))
    );
});

function LottieDemo() {
    const {
        jsonData,
        fontFaces,
        texts,
        markers,
        currentFrame,
        setCurrentFrame,
        isPlaying,
        setIsPlaying,
        fileName,
        textObjects,
        externalSources
    } = useContext(GlobalStateContext);
    const animationContainerRef = useRef(null);
    const [lottieInstance, setLottieInstance] = useState(null);
    const progressBarRef = useRef(null);

    const formatTimeFromFrames = useCallback((frame, frameRate) => {
        const seconds = Math.floor(frame / frameRate);
        const frames = frame % frameRate;
        return `${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        if (lottieInstance === null){
            updateLottie();
        }
    }, []);

    function updateLottie() {
        if (!jsonData) return;
        let onEnterFrame;

        const instance = lottie.loadAnimation({
            container: animationContainerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: isPlaying,
            animationData: jsonData,
        });

        const timeoutId = setTimeout(() => {
            instance.goToAndStop(currentFrame, true);
            if (isPlaying) instance.play();


            onEnterFrame = (e) => {
                setCurrentFrame(Math.round(e.currentTime));
            };

            instance.addEventListener('enterFrame', onEnterFrame);
            setLottieInstance(instance);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            instance.removeEventListener('enterFrame', onEnterFrame);
            instance.destroy();
            setTimeout(updateTimeFields, 500);
        };

    }

    const adjustSvgWidth = () => {
        if (animationContainerRef.current) {
            const svgElement = animationContainerRef.current.querySelector('svg');
            if (svgElement) {
                svgElement.style.width = 'auto';
            }
        }
    };

    function updateTimeFields() {
        try {
            const animationPreviewElement = document.getElementById('animationPreview');
            if (!animationPreviewElement) {
                console.log("Error updating Clock: animationPreview element not found.");
                return;
            }

            const svgElement = animationPreviewElement.querySelector('svg');
            if (!svgElement) {
                console.log("Error updating Clock: SVG element not found.");
                return;
            }

            const gElements = svgElement.getElementsByTagName('g');
            const formatMap = {
                'cc:cc:cc': 'HH:mm:ss',
                'cc:cc': 'HH:mm',
            };

            for (let g of gElements) {
                const ariaLabel = g.getAttribute('aria-label');
                const format = formatMap[ariaLabel];

                if (format) {
                    const textElements = Array.from(g.getElementsByTagName('text'));

                    function updateTime() {
                        const now = new Date();
                        let formattedTime;

                        if (format === 'HH:mm:ss') {
                            formattedTime = now.toLocaleTimeString();
                        } else if (format === 'HH:mm') {
                            formattedTime = now.toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'});
                        }

                        const timeParts = formattedTime.split(':');

                        if (timeParts.length >= 2) {
                            textElements[0].textContent = timeParts[0][0];
                            textElements[1].textContent = timeParts[0][1];
                            textElements[2].textContent = ':';
                            textElements[3].textContent = timeParts[1][0];
                            textElements[4].textContent = timeParts[1][1];

                            if (timeParts.length === 3 && format === 'HH:mm:ss') {
                                textElements[5].textContent = ':';
                                textElements[6].textContent = timeParts[2][0];
                                textElements[7].textContent = timeParts[2][1];
                            }
                        }
                    }

                    setInterval(updateTime, 1000);
                    updateTime();
                }
            }
        } catch (e) {
            console.log("Error updating Clock: ", e);
        }
    }


    useEffect(() => {
        if (!lottieInstance) return;
        isPlaying ? lottieInstance.play() : lottieInstance.pause();
        adjustSvgWidth();
    }, [isPlaying, lottieInstance]);

    const togglePlayPause = () => {
        setIsPlaying((prevIsPlaying) => {
            const shouldPlay = !prevIsPlaying;
            if (lottieInstance) {
                shouldPlay ? lottieInstance.play() : lottieInstance.pause();
            }
            return shouldPlay;
        });
    };

    const stepFrame = (direction) => {
        if (!lottieInstance) return;
        if (isPlaying) {
            togglePlayPause();
        }
        const newFrame = Math.max(0, Math.min(currentFrame + direction, jsonData.op - 1));
        lottieInstance.goToAndStop(newFrame, true);
        setCurrentFrame(newFrame);
    };

    const goToMarker = useCallback((markerFrame) => {
        if (lottieInstance) {
            setIsPlaying(false);
            lottieInstance.goToAndStop(markerFrame, true);
            setCurrentFrame(markerFrame);
        }
    }, [lottieInstance, setCurrentFrame]);

    const playCurrenMarker = () => {
        const currentMarker = markers.find(marker => currentFrame >= marker.tm && currentFrame < marker.tm + marker.dr);
        if (currentMarker) {
            setIsPlaying(true);

            const checkInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstance.currentFrame);
                if (currentFrame >= currentMarker.tm + currentMarker.dr) {
                    clearInterval(checkInterval);
                    setIsPlaying(false);
                    lottieInstance.goToAndStop(currentMarker.tm + currentMarker.dr, true);
                    setCurrentFrame(currentMarker.tm + currentMarker.dr);
                }
            }, 1000 / jsonData.fr);
        } else {

        }
    };

    const playStart = () => {
        const startMarker = markers.find(obj => obj.cm === "start");
        if (startMarker) {
            console.log(startMarker);
            setCurrentFrame(startMarker.tm);
            lottieInstance.goToAndStop(startMarker.tm, true);

            setIsPlaying(true);

            const checkInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstance.currentFrame);
                if (currentFrame >= startMarker.tm + startMarker.dr) {
                    clearInterval(checkInterval);
                    setIsPlaying(false);

                    setCurrentFrame(startMarker.tm + startMarker.dr);
                }
            }, 1000 / jsonData.fr);
        } else {
            console.log("no start marker");
        }
    }

    useEffect(() => {
        if (!jsonData) return;
        const progress = currentFrame / (jsonData.op - jsonData.ip);
        if (progressBarRef.current) {
            progressBarRef.current.style.width = `${progress * 100}%`;
        }
    }, [currentFrame, jsonData]);

    const calculateAspectRatio = (width, height) => {
        const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);
        const divisor = gcd(width, height);
        return `${width / divisor} / ${height / divisor}`;
    };

    const aspectRatio = calculateAspectRatio(jsonData.w, jsonData.h);

    const style = {
        aspectRatio: aspectRatio,
        maxWidth: jsonData.w
    };

    if (!jsonData) {
        return null;
    }

    return (
        <>
            {jsonData.markers && jsonData.markers.length > 0 &&
                <div id="previewWrapper">
                    <div id="animationPreview" style={style} ref={animationContainerRef}/>
                    <div id="previewControlContainer">
                        <div id="progressBarContainer">
                            <div id="progressBar" ref={progressBarRef}/>
                            <MarkersContainer markers={markers} goToMarker={goToMarker}/>
                        </div>
                        <div id="previewControls">
                            <div id="timeDisplay" title="Time (seconds:frame)">
                                {formatTimeFromFrames(currentFrame, jsonData.fr)}
                            </div>
                            <div className="previewControlButton" title="Frame back" onClick={playStart}>
                                Play
                            </div>
                            <div className="previewControlButton" title="Frame back" onClick={playCurrenMarker}>
                                Next
                            </div>
                            <div className="previewControlButton" title="Frame back" onClick={updateLottie}>
                                Update
                            </div>
                            <div className="previewControlButton" title="Frame back" onClick={() => stepFrame(-1)}>
                                Stop
                            </div>
                        </div>
                    </div>
                </div>
            }
        </>
    );
}

export default LottieDemo;
