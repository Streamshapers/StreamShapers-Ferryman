import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../Context/GlobalStateContext";
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
        textObjects,
        clocks
    } = useContext(GlobalStateContext);
    const animationContainerRef = useRef(null);
    const lottieInstanceRef = useRef(null);
    const progressBarRef = useRef(null);
    const timeFieldsSetRef = useRef(false);
    const clockIntervalIdsRef = useRef([]);

    const formatTimeFromFrames = useCallback((frame, frameRate) => {
        const seconds = Math.floor(frame / frameRate);
        const frames = frame % frameRate;
        return `${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        if (!jsonData) return;
        let onEnterFrame;
        clockIntervalIdsRef.current.forEach(id => clearInterval(id));

        const instance = lottie.loadAnimation({
            container: animationContainerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: isPlaying,
            animationData: jsonData,
        });

        //console.log("generated: ", instance);
        //console.log("texts: ", textObjects);

        const timeoutId = setTimeout(() => {
            if (isPlaying) {
                instance.play();
            } else {
                instance.goToAndStop(currentFrame, true);
            }


            onEnterFrame = (e) => {
                setCurrentFrame(Math.round(e.currentTime));
            };

            instance.addEventListener('enterFrame', onEnterFrame);
            lottieInstanceRef.current = instance;
            updateTimeFields();
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            instance.removeEventListener('enterFrame', onEnterFrame);
            instance.destroy();
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

    function getTime(type, addSeconds = 0) {
        const formats = {
            clock1: {hour: "2-digit", minute: "2-digit", hour12: false},
            clock2: {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false},
            clock3: {hour: "2-digit", minute: "2-digit", hour12: true},
            clock4: {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true},
            clock5: {hour: "2-digit", minute: "2-digit", hour12: true},
            clock6: {hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true},
        };

        let now = new Date();
        now.setSeconds(now.getSeconds() + addSeconds);

        let formatted = new Intl.DateTimeFormat("en-GB", formats[type]).format(now);

        if (type === "clock5" || type === "clock6") {
            formatted = formatted.replace(/\s?(AM|PM)$/i, '');
        }

        return formatted;
    }


    function updateTimeFields() {
        try {
            clockIntervalIdsRef.current.forEach(id => clearInterval(id));
            clockIntervalIdsRef.current = [];

            function updateTime() {
                const preview = document.getElementById('animationPreview');
                if (!preview) return;

                const rendererElements = lottieInstanceRef.current?.renderer?.elements;
                if (!rendererElements) return;

                Object.entries(clocks.current).forEach(([clockKey, layerNames]) => {
                    const time = getTime(clockKey);

                    layerNames.forEach((layerName) => {
                        const target = rendererElements.find(
                            (el) => el?.data?.nm === layerName && typeof el.updateDocumentData === "function"
                        );
                        if (target) {
                            target.updateDocumentData({t: time});
                        } else {
                            // Optional: Warnung bei fehlendem Layer
                            // console.warn(`Layer ${layerName} not found in ${clockKey}`);
                        }
                    });
                });

                if (!isPlaying) {
                    try {
                        let saveFrame = currentFrame;
                        if (lottieInstanceRef.current.getDuration(1) === jsonData.op) {
                            saveFrame = lottieInstanceRef.current.currentFrame;
                        }
                        lottieInstanceRef.current.renderer.renderFrame(saveFrame + 1);
                        lottieInstanceRef.current.renderer.renderFrame(saveFrame);
                    } catch (e) {
                        console.log("RenderFrame error:", e);
                    }
                }
            }

            const id = setInterval(updateTime, 1000);
            clockIntervalIdsRef.current.push(id);
            updateTime();
        } catch (e) {
            console.log("Error updating Clock:", e);
        }
    }


    useEffect(() => {
        if (!lottieInstanceRef.current) return;
        isPlaying ? lottieInstanceRef.current.play() : lottieInstanceRef.current.pause();
        adjustSvgWidth();
    }, [isPlaying, lottieInstanceRef.current]);

    const togglePlayPause = () => {
        setIsPlaying((prevIsPlaying) => {
            const shouldPlay = !prevIsPlaying;
            if (lottieInstanceRef.current) {
                shouldPlay ? lottieInstanceRef.current.play() : lottieInstanceRef.current.pause();
            }
            return shouldPlay;
        });
    };

    const stepFrame = (direction) => {
        if (!lottieInstanceRef.current) return;
        if (isPlaying) {
            togglePlayPause();
        }
        const newFrame = Math.max(0, Math.min(currentFrame + direction, jsonData.op - 1));
        lottieInstanceRef.current.goToAndStop(newFrame, true);
        setCurrentFrame(newFrame);
    };

    const goToMarker = useCallback((markerFrame) => {
        if (lottieInstanceRef.current) {
            setIsPlaying(false);
            lottieInstanceRef.current.goToAndStop(markerFrame, true);
            setCurrentFrame(markerFrame);
        }
    }, [lottieInstanceRef.current, setCurrentFrame]);

    const playCurrenMarker = () => {
        const currentMarker = markers.find(marker => currentFrame >= marker.tm && currentFrame < marker.tm + marker.dr);
        if (currentMarker) {
            setIsPlaying(true);

            const checkInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstanceRef.current.currentFrame);
                if (currentFrame >= currentMarker.tm + currentMarker.dr - 1) {
                    clearInterval(checkInterval);
                    setIsPlaying(false);
                    lottieInstanceRef.current.goToAndStop(currentMarker.tm + currentMarker.dr - 1, true);
                    setCurrentFrame(currentMarker.tm + currentMarker.dr - 1);
                }
            }, 1000 / jsonData.fr);
        } else {

        }
    };

    const downloadCurrentFrame = () => {
        if (!isPlaying && lottieInstanceRef.current) {
            const svgElement = lottieInstanceRef.current.renderer.svgElement;
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
                    <div className="previewControlButton" title="Frame back" onClick={() => stepFrame(-1)}>
                        <FontAwesomeIcon icon={faBackwardStep}/>
                    </div>
                    <div className="previewControlButton" title="Play/Pause" onClick={togglePlayPause}>
                        <FontAwesomeIcon icon={!isPlaying ? faPlay : faPause}/>
                    </div>
                    <div className="previewControlButton" title="Frame next" onClick={() => stepFrame(1)}>
                        <FontAwesomeIcon icon={faForwardStep}/>
                    </div>
                    {jsonData.markers && jsonData.markers.length > 0 &&
                        <div className="previewControlButton" title="Play current Marker and stop"
                             onClick={playCurrenMarker}>
                            <FontAwesomeIcon icon={faForwardFast}/>
                        </div>
                    }
                    <div className="previewControlButton" title="<Save current Frame>" onClick={downloadCurrentFrame}>
                        <FontAwesomeIcon icon={faCamera}/>
                    </div>
                </div>
            </div>
        </>
    );
}

export default AnalyzePlayer;
