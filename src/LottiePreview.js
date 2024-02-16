import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "./GlobalStateContext";
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

function LottiePreview() {
    const {jsonData, fontFaces, texts} = useContext(GlobalStateContext);
    const animationContainerRef = useRef(null);
    const progressBarRef = useRef(null);
    const [lottieInstance, setLottieInstance] = useState(null);
    const [isPlaying, setIsPlaying] = useState(true);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [markers, setMarkers] = useState([]);
    const [markersSet, setMarkersSet] = useState(false);
    const progressBarWidth = useRef('0%');

    useEffect(() => {
        if (!jsonData) return;

        // Initialisieren der Lottie-Animation
        const instance = lottie.loadAnimation({
            container: animationContainerRef.current,
            renderer: 'svg',
            loop: true,
            autoplay: isPlaying,
            animationData: jsonData,
        });

        instance.goToAndStop(currentFrame);
        if (isPlaying) instance.play();

        const onEnterFrame = (e) => {
            setCurrentFrame(Math.round(e.currentTime));
            const progress = e.currentTime / (jsonData.op - jsonData.ip);
            progressBarWidth.current = `${progress * 100}%`;
            if (progressBarRef.current) {
                progressBarRef.current.style.width = progressBarWidth.current;
            }
        };

        instance.addEventListener('enterFrame', onEnterFrame);
        setLottieInstance(instance);

        console.log('preview rendered');

        return () => {
            instance.removeEventListener('enterFrame', onEnterFrame);
            instance.destroy();
        };

    }, [jsonData, texts]);

    useEffect(() => {
        if (!jsonData) return;

        if (!markersSet) {
            console.log('markers set');

            setMarkers(jsonData.markers || []);
            setMarkersSet(true);

            return () => {
                setMarkers([]);
            };
        }

    }, [jsonData]);

    function formatTimeFromFrames(currentFrame, frameRate) {
        const seconds = Math.floor(currentFrame / frameRate);
        const frames = currentFrame % frameRate;

        const formattedSeconds = seconds.toString().padStart(2, '0');
        const formattedFrames = frames.toString().padStart(2, '0');

        return `${formattedSeconds}:${formattedFrames}`;
    }

    useEffect(() => {
        if (!lottieInstance) return;
        isPlaying ? lottieInstance.play() : lottieInstance.pause();
    }, [isPlaying]);

    const togglePlayPause = () => {
        isPlaying ? setIsPlaying(false) : setIsPlaying(true);
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

    const ProgressBar = React.memo(({width}) => (
        <div id="progressBar" style={{width}}></div>
    ));


    const goToNextMarker = () => {
        const nextMarker = markers.find(marker => marker.tm > currentFrame);
        if (nextMarker) {
            setIsPlaying(true);

            const checkInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstance.currentFrame);
                if (currentFrame >= nextMarker.tm) {
                    clearInterval(checkInterval);
                    setIsPlaying(false);
                    setCurrentFrame(nextMarker.tm);
                }
            }, 1000 / jsonData.fr);
        } else {
            if (!isPlaying) {
                setIsPlaying(true);

                const checkInterval = setInterval(() => {
                    const currentFrame = Math.round(lottieInstance.currentFrame);
                    if (currentFrame >= jsonData.op - 1) {
                        clearInterval(checkInterval);
                        lottieInstance.goToAndStop(jsonData.ip, true);
                        setIsPlaying(false);
                        setCurrentFrame(jsonData.ip);
                    }
                }, 1000 / jsonData.fr);
            }
        }
    };

    const ProgressBarMarkers = React.memo(({markers, goToMarker}) => {
        return (
            <>
                {markers.map((marker, index) => (
                    <div
                        key={index}
                        className="progress-bar-marker"
                        style={{left: `${(marker.tm / jsonData.op) * 100}%`}}
                    >
                        <span className="marker-tooltip" onClick={() => goToMarker(marker.tm)}>{marker.cm}</span>
                    </div>
                ))}
            </>
        );
    }, (prevProps, nextProps) => {
        return prevProps.markers === nextProps.markers;
    });

    const goToMarker = useCallback((markerFrame) => {
        if (lottieInstance) {
            setIsPlaying(false);
            lottieInstance.goToAndStop(markerFrame, true);
            setCurrentFrame(markerFrame);
        }
    }, [lottieInstance]);


    const downloadCurrentFrame = () => {
        if (!isPlaying && lottieInstance) {
            const svgElement = lottieInstance.renderer.svgElement;
            const serializer = new XMLSerializer();
            let svgString = serializer.serializeToString(svgElement);

            svgString = svgString.replace('</svg>', `${fontFaces}</svg>`);

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
                downloadLink.download = 'current_frame.png'; // Anpassen für dynamischen Dateinamen
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);
            };

            img.src = svgUrl;
        }
    };

    if (!jsonData) {
        return null;
    }

    return (
        <>
            <div id="animationPreview">
                <div ref={animationContainerRef}/>
            </div>
            <div id="previewControlContainer">
                <div id="progressBarContainer">
                    <ProgressBar width={progressBarWidth}/>
                    <div id="markerContainer"></div>
                    <ProgressBarMarkers markers={markers} goToMarker={goToMarker}/>
                </div>
                <div id="previewControls">
                    <div id="timeDisplay"
                         title="Time (seconds:frame)">{formatTimeFromFrames(currentFrame, jsonData.fr)}</div>
                    <FontAwesomeIcon icon={faBackwardStep} className="previewControlButton" title="frame back (Pause)"
                                     onClick={() => stepFrame(-1)}/>
                    <FontAwesomeIcon icon={!isPlaying ? faPlay : faPause} className="previewControlButton"
                                     title="Play/Pause" onClick={togglePlayPause}/>
                    <FontAwesomeIcon icon={faForwardStep} className="previewControlButton" title="frame next (Pause)"
                                     onClick={() => stepFrame(1)}/>
                    <FontAwesomeIcon icon={faForwardFast} className="previewControlButton" title="Play to next Marker"
                                     onClick={goToNextMarker}/>
                    <FontAwesomeIcon icon={faCamera} className="previewControlButton" title="Save current Frame"
                                     onClick={downloadCurrentFrame}/>{/*TODO: ausgrauen bei Play*/}
                </div>
            </div>
        </>
    );
}

export default LottiePreview;
