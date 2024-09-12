import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import lottie from 'lottie-web';
import {
    faBackwardStep,
    faCamera,
    faForwardFast,
    faForwardStep,
    faPause,
    faPlay
} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

const MarkersContainer = React.memo(({markers, goToMarker}) => {
    const {jsonData} = useContext(GlobalStateContext);

    if (!markers) {
        return null;
    }

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
                        //top: index % 2 === 0 ? '25px' : '20px',
                    }}
                ></div>
            </React.Fragment>
        ))
    );
});

function AnalyzePlayer() {
    const {
        jsonData,
        fontFaces,
        markers,
        currentFrame,
        setCurrentFrame,
        isPlaying,
        setIsPlaying,
        fileName,
        textObjects
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

    }, [jsonData, textObjects, textObjects]);

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
                //console.log("Error updating Clock: animationPreview element not found.");
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
                        let formattedTime;

                        if (format === 'HH:mm:ss') {
                            formattedTime = new Intl.DateTimeFormat("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                second: "2-digit",
                                hour12: false
                            }).format(new Date());
                        } else if (format === 'HH:mm') {
                            formattedTime = new Intl.DateTimeFormat("en-GB", {
                                hour: "2-digit",
                                minute: "2-digit",
                                hour12: false
                            }).format(new Date());
                        }

                        const timeParts = formattedTime.match(/\d{2}/g);

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
                if (currentFrame >= currentMarker.tm + currentMarker.dr - 1) {
                    clearInterval(checkInterval);
                    setIsPlaying(false);
                    lottieInstance.goToAndStop(currentMarker.tm + currentMarker.dr - 1, true);
                    setCurrentFrame(currentMarker.tm + currentMarker.dr - 1);
                }
            }, 1000 / jsonData.fr);
        } else {

        }
    };

    const downloadCurrentFrame = () => {
        if (!isPlaying && lottieInstance) {
            const svgElement = lottieInstance.renderer.svgElement;
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);
            for (const face in fontFaces) {
                svgString = svgString.replace('</svg>', `${face}</svg>`);
            }

            const svgBlob = new Blob([svgString], {type: 'image/svg+xml'});
            const svgUrl = URL.createObjectURL(svgBlob);

            const img = new Image();
            img.onload = () => {
                const canvas = document.createElement('canvas');
                canvas.width = img.width;
                canvas.height = img.height;

                const ctx = canvas.getContext('2d');
                ctx.drawImage(img, 0, 0);
                URL.revokeObjectURL(svgUrl);

                const downloadUrl = canvas.toDataURL('image/png');
                const downloadLink = document.createElement('a');
                downloadLink.href = downloadUrl;
                downloadLink.download = fileName + "_Frame_" + currentFrame + '.png';
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };

            img.src = svgUrl;
        }
    };

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
                    <FontAwesomeIcon icon={faBackwardStep} className="previewControlButton" title="Frame back"
                                     onClick={() => stepFrame(-1)}/>
                    <FontAwesomeIcon icon={!isPlaying ? faPlay : faPause} className="previewControlButton"
                                     title="Play/Pause" onClick={togglePlayPause}/>
                    <FontAwesomeIcon icon={faForwardStep} className="previewControlButton" title="Frame next"
                                     onClick={() => stepFrame(1)}/>
                    {jsonData.markers && jsonData.markers.length > 0 &&
                        <FontAwesomeIcon icon={faForwardFast} className="previewControlButton"
                                         title="Play current Marker and stop"
                                         onClick={playCurrenMarker}/>}

                    <FontAwesomeIcon icon={faCamera} className="previewControlButton"
                                     title="<Save current Frame>"
                                     onClick={downloadCurrentFrame}/>
                </div>
            </div>
        </>
    );
}

export default AnalyzePlayer;
