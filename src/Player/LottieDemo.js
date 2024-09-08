import React, {useCallback, useContext, useEffect, useRef, useState} from 'react';
import {GlobalStateContext} from "../GlobalStateContext";
import lottie from 'lottie-web';

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
                    }}
                ></div>
            </React.Fragment>
        ))
    );
});

function LottieDemo() {
    const {
        jsonData,
        markers,
        isPlaying,
        setIsPlaying,
        updateGoogle,
        setUpdateGoogle,
        textObjects,
        updateTextRef,
        updateLottieText
    } = useContext(GlobalStateContext);
    const animationContainerRef = useRef(null);
    const lottieInstanceRef = useRef(null);
    const progressBarRef = useRef(null);
    const nextPlayRef = useRef(null);
    const currentLoopMarkerRef = useRef(null);
    const [clickedPlay, setClickedPlay] = useState(false);
    const toPlayRef = useRef([]);
    const [currentFrame, setCurrentFrame] = useState(0);
    const [nextMarkers, setNextMarkers] = useState([]);
    const nextCountRef = useRef(1);
    const updateExistRef = useRef(false);

    const formatTimeFromFrames = useCallback((frame, frameRate) => {
        const seconds = Math.floor(frame / frameRate);
        const frames = frame % frameRate;
        return `${seconds.toString().padStart(2, '0')}:${frames.toString().padStart(2, '0')}`;
    }, []);

    useEffect(() => {
        if (lottieInstanceRef.current === null) {
            updateLottie(false);
        }

        const updatedNextMarkers = [];
        markers.forEach((marker, index) => {
            if (marker.cm.includes("next") && !marker.cm.includes("loop")) {
                updatedNextMarkers.push(marker);
            }

            if (marker.cm.toLowerCase() === "update") {
                updateExistRef.current = true;
            }
        });
        setNextMarkers(updatedNextMarkers);

        return () => {
            if (lottieInstanceRef.current) {
                lottieInstanceRef.current.destroy();
            }
        };
    }, []);

    function updateLottie(update) {
        let oldInstance;
        if (lottieInstanceRef.current) {
            oldInstance = lottieInstanceRef.current;
            lottieInstanceRef.current.destroy();
        }


        if (!updateGoogle) {
            setUpdateGoogle(true);
        }

        if (!jsonData) return;
        let onEnterFrame;

        const instance = lottie.loadAnimation({
            container: animationContainerRef.current,
            renderer: 'svg',
            loop: false,
            autoplay: false,
            animationData: jsonData,
        });

        const timeoutId = setTimeout(() => {

            if (updateExistRef.current && update) {
                const updateMarker = markers.find(m => m.cm.toLowerCase() === "update");
                instance.goToAndStop(updateMarker.tm, true);
                setCurrentFrame(updateMarker.tm);
            } else {
                instance.goToAndStop(currentFrame, true);
            }

            onEnterFrame = (e) => {
                setCurrentFrame(Math.round(e.currentTime));
            };

            instance.addEventListener('enterFrame', onEnterFrame);
            const testInstance = instance;
            lottieInstanceRef.current = instance;
            if (oldInstance) {
                console.log(lottieInstanceRef.current);
                oldInstance.destroy();
            }
            if (updateExistRef.current && update) playMarker("update", true);
        }, 300);

        return () => {
            clearTimeout(timeoutId);
            instance.removeEventListener('enterFrame', onEnterFrame);
            instance.destroy();
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

    const goToMarker = useCallback((markerFrame) => {
        if (lottieInstanceRef.current) {
            setIsPlaying(false);
            lottieInstanceRef.current.goToAndStop(markerFrame, true);
            setCurrentFrame(markerFrame);
            const marker = markers.find(obj => obj.tm === markerFrame)
            if (marker.cm.includes("next") && !marker.cm.includes("loop")) {
                const match = marker.cm.match(/\d$/);
                if (match) {
                    nextCountRef.current = parseInt(match[0], 10);
                }
            }
        }
    }, [lottieInstanceRef.current, setCurrentFrame, setIsPlaying]);

    const playNext = () => {
        if (!isPlaying && toPlayRef.current.length > 0) {
            //console.log("started to play next marker! ", toPlayRef.current[0].cm);
            playMarker(toPlayRef.current[0].cm);
        }
        //console.log("toPlay:", toPlayRef.current);
    }

    const playMarker = (markerName) => {
        currentLoopMarkerRef.current = null;
        const backFrame = currentFrame;
        //console.log(backFrame)
        const marker = markers.find(obj => obj.cm === markerName);
        if (marker) {
            if (markerName.toLowerCase() === "start") {
                setClickedPlay(true);
                toPlayRef.current = [];
                nextCountRef.current = 1;
            } else if (markerName.toLowerCase() === "stop") {
                setClickedPlay(false);
                toPlayRef.current = [];
                nextCountRef.current = 1;
            }
            let nextMarker = markers.find(m => m.tm === marker.tm + marker.dr);

            if (markers.find(m => m.cm === marker.cm + "_loop")) {
                nextMarker = markers.find(m => m.cm === marker.cm + "_loop");
            } else if (marker.cm.includes("next")) {
                const nextCount = nextCountRef.current;
                nextMarker = markers.find(m => m.cm === "next" + nextCount);
            } else {
                nextMarker = markers.find(m => m.cm.toLowerCase() === "stop");
            }

            setCurrentFrame(marker.tm);
            lottieInstanceRef.current.goToAndPlay(marker.tm, true);
            setIsPlaying(true);

            const itv = 1000 / (jsonData.fr * 2);
            const checkInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstanceRef.current.currentFrame);
                const markerEnd = marker.tm + marker.dr - 1;

                if (currentFrame >= markerEnd) {
                    clearInterval(checkInterval);

                    if (currentFrame === markerEnd) {
                        if (marker.cm === "update") {
                            if (updateTextRef.current) {
                                const textObjectIndex = textObjects.findIndex(obj => obj.layername === updateTextRef.current.layername);
                                updateLottieText(textObjectIndex, updateTextRef.current.text);
                                updateTextRef.current = null;
                                goBackWhenReady(backFrame);
                            } else {
                                goBackWhenReady(backFrame);
                            }
                        } else {
                            lottieInstanceRef.current.goToAndStop(markerEnd, true);
                            setCurrentFrame(marker.tm + marker.dr - 1);
                        }
                    }

                    if (nextMarker && nextMarker.cm.endsWith("_loop")) {
                        currentLoopMarkerRef.current = nextMarker;
                    }

                    if (nextMarker && marker.cm !== "update") {
                        setIsPlaying(false);
                        setCurrentFrame(markerEnd);

                        if (nextMarker === toPlayRef.current[0]) {
                            playMarker(toPlayRef.current[0].cm);
                            toPlayRef.current.splice(0, 1);
                        }
                    }
                }
            }, itv);
            return () => clearInterval(checkInterval);
        } else {
            console.log(markerName + " Marker not found!");
        }
    };

    const goBackWhenReady = (backFrame) => {
        lottieInstanceRef.current.goToAndStop(backFrame, true);
        setCurrentFrame(backFrame);
        updateLottie(false);
    }


    useEffect(() => {
        if (currentLoopMarkerRef.current) {
            setCurrentFrame(currentLoopMarkerRef.current.tm);
            playLoopMarker();
        }
    }, [currentLoopMarkerRef.current]);

    const playLoopMarker = () => {
        if (currentLoopMarkerRef.current) {
            setIsPlaying(true);
            const loopInterval = setInterval(() => {
                const currentFrame = Math.round(lottieInstanceRef.current.currentFrame);

                if (currentLoopMarkerRef.current) {
                    if (currentFrame >= currentLoopMarkerRef.current.tm + currentLoopMarkerRef.current.dr - 1) {
                        if (toPlayRef.current.length > 0) {
                            currentLoopMarkerRef.current = null;
                            playMarker(toPlayRef.current[0].cm);
                            toPlayRef.current.splice(0, 1);
                        } else {
                            lottieInstanceRef.current.goToAndPlay(currentLoopMarkerRef.current.tm, true);
                            setCurrentFrame(currentLoopMarkerRef.current.tm);
                        }
                    }
                }
            }, 1000 / jsonData.fr);
            return () => clearInterval(loopInterval);
        }
    }

    const handleNext = () => {
        if (clickedPlay) {
            if (nextCountRef.current > nextMarkers.length) {
                playMarker("stop")
            } else {
                //console.log("next" + nextCountRef.current);
                let nextMarker = markers.find(m => m.cm === "next" + nextCountRef.current);
                //console.log(nextMarker);
                if (nextMarker) {
                    nextCountRef.current++;
                    toPlayRef.current = [...toPlayRef.current, nextMarker];
                    if (!currentLoopMarkerRef.current && toPlayRef.current.length === 1 && !isPlaying) {
                        playMarker(toPlayRef.current[0].cm);
                        toPlayRef.current.splice(0, 1);
                    }
                } else {
                    console.log("no next marker found!")
                }
            }
        }
    }

    const findNextMarker = (frame) => {
        const filteredMarkers = markers
            .filter(marker => marker.tm > frame && !marker.cm.endsWith('_loop'))
            .sort((a, b) => a.tm - b.tm);

        return filteredMarkers.length > 0 ? filteredMarkers[0] : null;
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
            {jsonData.markers && jsonData.markers.length > 0 &&
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
                            <div className="previewControlButton demo" title="Play" onClick={() => playMarker("start")}>
                                Play
                            </div>
                            <div className={`previewControlButton demo ${clickedPlay ? 'blue' : 'grey'}`} title="Next"
                                 onClick={handleNext}>
                                Next
                            </div>
                            <div className="previewControlButton demo" title="Update"
                                 onClick={() => updateLottie(true)}>
                                Update
                            </div>
                            <div className="previewControlButton demo" title="Stop" onClick={() => playMarker("stop")}>
                                Stop
                            </div>
                        </div>
                    </div>
                </>
            }
        </>
    );
}

export default LottieDemo;
