/**
 * OGRAF-Template by StreamShapers
 * visit streamshapers.com
 * made with StreamShapers Ferryman ${version}
 */

/**
 * TODO: Player, aktuelle Version mit offline fallback
 * TODO: spxTag?
 * TODO: google
 * TODO: ferrymanJson
 * ToDO: clocks
 */

/**
 * @typedef { import("https://ograf.ebu.io/v1-draft-0/specification/javascript-types/index.d.ts").GraphicsAPI.Graphic } Graphic
 */

let replacements;

/** @implements {Graphic} */
class FerrymanGraphic extends HTMLElement {

    _getReplacement(attr) {
        return replacements[attr];
    }

    constructor() {
        super();
        this.shadow = this.attachShadow({mode: 'open'});
        this.state = {
            lottieTemplate: null,
            lottieTemplateUpdate: undefined,
            lottieTemplateNew: null,
            playStatus: "",
            nextCount: 1,
            nextTotal: 0,
            showInfo: false,
            currentSegment: 'start',
            startPlayed: false,
            currentSegmentFrames: null,
            animReady: this._createDeferredPromise(),
            animLoaded: this._createDeferredPromise(),
            animation: null,
            newAnimation: null,
            updateAnimation: null,
            stopExist: false,
            showLogs: false,
            imagesPathPrefix: this._getReplacement("imagePath"),
            updateCounter: 1,
            currentFrame: null,
            updateExist: false,
            lottieState: 'idle',
            markers: [],
            playStack: [],
            breakFrame: undefined,
            fetchSheet: true,
            data: {},
            clockIntervalIds: [],
            textElements: []
        };
    }

    async load(loadParams) {
        const temp = document.createElement('div');
        temp.innerHTML = this._getReplacement("fontFaceStyles");
        const styleNode = temp.querySelector('style');
        if (styleNode) this.shadow.appendChild(styleNode);

        const lottieModule = await import("https://esm.sh/lottie-web@5.12.2");
        this.lottie = lottieModule.default;
        console.log(loadParams);

        const url = import.meta.resolve("./lib/lottie-template.json");
        const response = await fetch(url);
        this.state.lottieTemplate = await response.json();
        this.state.lottieTemplateNew = JSON.parse(JSON.stringify(this.state.lottieTemplate));

        //fix and check markers
        this.state.lottieTemplate.markers.forEach((marker) => {
            const name = marker.cm;
            this.state.markers.push(name);
            marker.cm = name.toLowerCase();

            if (name.includes("next") && !name.includes("loop")) this.state.nextTotal++;
            if (name === "stop") this.state.stopExist = true;
            if (name === "update") this.state.updateExist = true;
        })

        this._updateLottieData(loadParams.data, this.state.lottieTemplateNew)

        const script = document.createElement('script');
        //script.src = 'https://cdn.jsdelivr.net/npm/@lottiefiles/dotlottie-web/+esm';
        script.src = import.meta.resolve("./lib/lottie-player.js")
        this.shadow.appendChild(script);

        const animDiv = document.createElement('div');
        animDiv.id = 'animation1';
        this.shadow.appendChild(animDiv);

        this.state.animation = this.lottie.loadAnimation({
            autoplay: false,
            loop: false,
            container: animDiv,
            renderer: 'svg',
            animationData: this.state.lottieTemplateNew
        });
        //this.shadow.appendChild(this.state.animation);

        //-----

        console.log(this.state.animation)
        if (!this.state.animation.renderer.data.fonts || !this.state.animation.renderer.data.fonts.list || this.state.animation.renderer.data.fonts.list.length === 0) {
            if (this.state.showLogs) console.log("No fonts found");
        } else {
            const fonts = this.state.animation.renderer.data.fonts.list;
            if (fonts) {
                for (const font in fonts) {
                    let family = fonts[font].fFamily;
                    let fontPath = fonts[font].fPath;
                    if (fontPath !== '') {
                        this._addFont(family, fontPath);
                    }
                }
            }
        }

        this.state.animation.addEventListener("DOMLoaded", () => {
            if (this.state.showLogs) console.log("Template - Ready");
            this.state.animReady.resolve("ready");
        });


        this._addEvents(this.state.animation);

        //this._updateTimeField("animation" + this.state.updateCounter);

        await this.state.animReady;
        this.state.animation.goToAndStop(0, true);
        this.state.playStatus = "loaded";
        this.state.currentSegment = "start";
        this.state.animLoaded.resolve("Template - Animation is Ready");

        //----

        // Warte, bis der Player verfügbar ist
        await new Promise(resolve => setTimeout(resolve, 100));

        // When everything is loaded we can return:
        return {};
    }

    async playAction() {
        if (!this.state.startPlayed) {
            await this.state.animLoaded.promise;
            console.log("AnimLoaded");
            await this.state.animReady;
            console.log("animReady");
            await this._loadFonts();
            console.log("fonts loaded");
            this.state.animation.goToAndPlay("start", true);
            this.state.playStatus = "play";
            this.state.currentSegment = "start";
            if (this.state.showLogs) console.log("Template - Play 'start' marker");
            if (this.state.markers.includes("start_loop")) this.state.playStack.push("start_loop");
            this.state.startPlayed = true;
        } else {
            if (this.state.nextCount > this.state.nextTotal && this.state.stopExist) {
                stop();
                if (this.state.showLogs) console.log("Template - No 'next' marker left - Play 'stop' Marker");
            } else {
                if (this.state.lottieState === "idle") {
                    this.state.animation.goToAndPlay("next" + this.state.nextCount, true);
                    this.state.currentSegment = "next" + this.state.nextCount;
                    if (this.state.showLogs) console.log("Template - Play 'next" + this.state.nextCount + "' Marker");
                } else {
                    //this.state.playStack.shift()
                    this.state.playStack.push("next" + this.state.nextCount);
                    if (this.state.markers.includes("next" + this.state.nextCount + "_loop")) this.state.playStack.push("next" + this.state.nextCount + "_loop");
                }
                this.state.nextCount++;
            }
        }

        //this._updateTimeField("animation" + updateCounter);
        return {};

    }

    async stopAction() {
        if (this.state.stopExist) {
            if (this.state.lottieState === "idle") {
                this.state.animation.goToAndPlay("stop", true);
                if (this.state.showLogs) console.log("Template - Play 'stop' Marker");
                this.state.nextCount = 1;
                this.state.startPlayed = false;
            } else {
                //playStack.length=0
                this.state.playStack.push("stop");
                this.state.nextCount = 1;
                this.state.startPlayed = false;
            }
        } else {
            if (this.state.showLogs) console.log("Template - No 'stop' marker - destroy Animation");
            this.state.animation.destroy();
        }
        this.state.playStatus = "stop";
        return {};

    }

    async updateAction(rawData) {
        console.log(rawData);
        if (this.state.lottieState !== "idle") console.log("Updating is not possible while Playing ");
        if (this.state.showLogs) console.log(`Update triggered: ${rawData}`);

        this.state.lottieTemplateUpdate = JSON.parse(JSON.stringify(this.state.lottieTemplateNew)); //copy the "old" updated template for the update Animation
        this.state.lottieTemplateNew = JSON.parse(JSON.stringify(this.state.lottieTemplate));
        let parsed;

        if (rawData) {
            parsed = rawData;
        }
        /*if (this.state.fetchSheet && this.state.googleTableCells) {
            parsed = await updateGoogleTableData(parsed);
        }*/
        if (parsed) {
            console.log("parsed", parsed)
            for (let key of Object.keys(parsed.data)) {
                this.state.data[key] = parsed.data[key];
            }
            console.log("data", this.state.data)
        }
        if (this.state.data) {
            for (let key of Object.keys(this.state.data)) {
                if (key === "_templateInfo") this.state.showInfo = true;
                if (key === "_debug") this.state.showLogs = true;
                if (key === "epochID") this.state.imagesPathPrefix = "";
                if (key === "_stopFetch") this.state.fetchSheet = false;
            }
            this._updateLottieData(this.state.data, this.state.lottieTemplateNew);
        }

        //first Update and create Lottie for the first time
        if (this.state.playStatus === "") {

        }
        //Update when tamplate is playing
        if (this.state.playStatus === "play" && this.state.lottieState === "idle") {
            let updateData = JSON.parse(JSON.stringify(this.state.data))
            this.state.updateCounter++;

            //Only for UpdateAnimations
            if (this.state.updateExist && updateData) {
                const updateStartFrame = this.state.currentFrame;
                if (this.state.showLogs) console.log(`Update triggered at frame: ${updateStartFrame}`);

                for (let key of Object.keys(updateData)) {
                    this.state.lottieTemplateUpdate.layers.forEach((layer) => {
                        if (layer.nm === `${key}_update`) {
                            updateData[`${key}_update`] = updateData[key];
                            delete updateData[key];
                        }
                    });
                }
                for (let key of Object.keys(updateData)) {
                    this.state.lottieTemplateUpdate.layers.forEach((layer) => {
                        if (layer.nm === key) {
                            if ('refId' in layer) {
                                this._updateAssetsByRefid(this.state.lottieTemplateUpdate.assets, layer.refId, updateData[key]);
                            } else {
                                this._updateLayerText(layer, updateData[key])
                            }
                        }
                    })
                }
                const newDiv = document.createElement("div");
                newDiv.id = "animation" + this.state.updateCounter;
                this.shadow.appendChild(newDiv);

                this.state.updateAnimation = this.lottie.loadAnimation({
                    container: this.shadow.getElementById("animation" + this.state.updateCounter),
                    renderer: "svg",
                    loop: false,
                    autoplay: false,
                    animationData: this.state.lottieTemplateUpdate,
                });

                this.state.updateAnimation.addEventListener("DOMLoaded", async function () {
                    //this._updateTimeField("animation" + this.state.updateCounter);
                    if (this.state.showInfo) console.log("Template - updated Animation Ready");
                    this._addEvents(this.state.updateAnimation);
                    const updateMarker = this.state.lottieTemplateUpdate.markers.find(marker => marker.cm === "update");
                    this.state.updateAnimation.goToAndPlay("update", true);
                    this.state.animation.destroy();
                    this.shadow.getElementById("animation" + (this.state.updateCounter - 1)).remove();
                    this.state.animation = this.state.updateAnimation;
                    this.state.updateAnimation = null;
                    this.state.animation.addEventListener("_idle", () => {
                        this.state.lottieState = "idle";
                        if (this.state.showInfo) console.log(`LottieState: "${this.state.lottieState}`);

                        this.state.updateCounter++;
                        const newDiv = document.createElement("div");
                        newDiv.id = "animation" + this.state.updateCounter;
                        this.shadow.appendChild(newDiv);

                        this.state.newAnimation = this.lottie.loadAnimation({
                            container: this.shadow.getElementById("animation" + this.state.updateCounter),
                            renderer: "svg",
                            loop: false,
                            autoplay: false,
                            animationData: this.state.lottieTemplateNew,
                        });

                        this.state.newAnimation.addEventListener("DOMLoaded", () => {
                            //this._updateTimeField("animation" + this.state.updateCounter);
                            if (this.state.showInfo) console.log("Template - updated Animation Ready");
                            this._addEvents(this.state.newAnimation);
                            this.state.newAnimation.goToAndStop(updateStartFrame, true);
                            this.state.animation.destroy();
                            this.shadow.getElementById("animation" + (this.state.updateCounter - 1)).remove();
                            this.state.animation = this.state.newAnimation;
                            this.state.newAnimation = null;
                        });
                    });
                });
            }
            //only without update animation
            if (!this.state.updateExist) {
                const newDiv = document.createElement("div");
                newDiv.id = "animation" + this.state.updateCounter;
                this.shadow.appendChild(newDiv);

                this.state.newAnimation = this.lottie.loadAnimation({
                    container: this.shadow.getElementById("animation" + this.state.updateCounter),
                    renderer: "svg",
                    loop: false,
                    autoplay: false,
                    animationData: this.state.lottieTemplateNew,
                });

                this.state.newAnimation.addEventListener("DOMLoaded", () => {
                    //this._updateTimeField("animation" + this.state.updateCounter);
                    if (this.state.showInfo) console.log("Template - updated Animation Ready");
                    this.state.newAnimation.goToAndStop(this.state.currentFrame, true);
                    //breakFrame = getMarker(currentSegment).tm + getMarker(currentSegment).dr
                    //console.log("BREAK: " + breakFrame)
                    const oldDiv = this.shadow.getElementById("animation" + (this.state.updateCounter - 1));
                    if (oldDiv) oldDiv.remove();

                    this.state.animation.destroy();
                    this.state.animation = this.state.newAnimation;
                    this.state.animation.addEventListener("enterFrame", () => {
                        for (let marker of this.state.lottieTemplate.markers) {
                            if (marker.cm === "name:" + this.state.currentSegment) {
                                this.state.currentSegmentFrames = marker.tm;
                            }
                        }
                        this.state.currentFrame = this.state.animation.currentFrame + this.state.currentSegmentFrames;
                        if (this.state.showLogs) console.log(`Current Frame: ${this.state.currentFrame}`);
                    });

                    this._addEvents(this.state.animation);
                    //breakFrame = getMarker(currentSegment).tm + getMarker(currentSegment).dr
                    this.state.newAnimation = null;
                });
            }
        }
        //if (this.state.showInfo) info();
        return {};
    }

    async dispose(_params) {
        this.shadow.innerHTML = "";
        return {};
    }

    async getStatus(_params) {
        return {};
    }

    async customAction(params) {
        // optional: highlight, blink, etc.
        return {};

    }

    async goToTime(payload) {
        return {};
    }

    async setActionsSchedule(payload) {
        return {};
    }

    _createDeferredPromise() {
        let resolver, rejecter;
        const promise = new Promise((resolve, reject) => {
            resolver = resolve;
            rejecter = reject;
        });
        return {
            promise,
            resolve: resolver,
            reject: rejecter
        };
    }

    _addFont = (fam, path) => {
        const newFont = document.createElement('style');
        newFont.appendChild(document.createTextNode(`\
            @font-face {\
                font-family: ${fam};\
                src: url('${path}');\
            }\
            `));
        document.head.appendChild(newFont);
    }

    _pause(sec) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                resolve("Die " + sec + " Sekunden Pause ist vorbei");
            }, sec * 1000);
        });
    }

    _loadFonts() {
        return new Promise((resolve, reject) => {
            const fontPromises = [];

            if (!this.state.lottieTemplate.fonts || !this.state.lottieTemplate.fonts.list || this.state.lottieTemplate.fonts.list.length === 0) {
                if (this.state.showLogs) console.log("No fonts found");
                resolve("No fonts found");
            } else {
                const fonts = this.state.lottieTemplate.fonts.list;
                for (const font of fonts) {
                    if (font.fPath !== '') {
                        fontPromises.push(new FontFace(font.fFamily, `url(${font.fPath})`).load());
                    }
                }

                Promise.all(fontPromises).then(() => resolve('Fonts loaded')).catch(err => reject(err));
            }

        });
    }

    _decodeHtmlEntities(encodedString) {
        const textArea = document.createElement("textarea");
        textArea.innerHTML = encodedString;
        return textArea.value;
    }

    _updateLayerText(layer, newText) {
        layer.t.d.k[0].s.t = this._decodeHtmlEntities(newText);
    }

    _updateAssetsByRefid(array, searchValue, newValue) {
        const foundObject = array.find(obj => obj['id'] === searchValue);

        if (foundObject) {
            foundObject['u'] = this.state.imagesPathPrefix;
            foundObject['p'] = newValue;
            foundObject['e'] = 0;
            return foundObject;
        }

        return null;
    }

    _getMarker(markerName) {
        for (let marker of this.state.lottieTemplate.markers) {
            if (marker.cm === markerName) return marker;
        }
    }

    _triggerPlayStack() {
        setTimeout(() => {
            if (this.state.showLogs) console.log(`LottieState: ${this.state.lottieState}`);
            if (this.state.currentSegment === "stop") {
                animation.destroy();
            }
            if (this.state.playStack.length === 0 && this.state.currentSegment.includes("loop")) this.state.playStack.push(this.state.currentSegment);
            if (this.state.playStack[0]) {
                const nextSegment = this.state.playStack[0];
                this.state.animation.goToAndPlay(nextSegment, true);
                if (this.state.showLogs) console.log(`Template - Play   ${nextSegment} "Marker"`);
                this.state.currentSegment = nextSegment;
                this.state.playStack.shift();
            }
        }, 0);
    }

    _addEvents(animation) {
        animation.addEventListener("enterFrame", () => {
            this.state.currentSegmentFrames = this._getMarker(this.state.currentSegment).tm;
            //if (showLogs) console.log(`Current Animation Frame: ${Math.round(animation.currentFrame)}`);
            this.state.currentFrame = Math.round(animation.currentFrame) + this.state.currentSegmentFrames;
            //if (currentFrame === breakFrame) console.log("!!!!!!!!!!!!!") //triggerPlayStack()
            if (this.state.showLogs) console.log(`Current Frame: ${this.state.currentFrame}`);
        });
        animation.addEventListener("_play", () => {
            this.state.lottieState = "play";
            if (this.state.showLogs) console.log(`LottieState: ${this.state.lottieState}`);
        });
        animation.addEventListener("_pause", () => {
            this.state.lottieState = "pause";
            this._triggerPlayStack();
        });
        animation.addEventListener("_idle", () => {
            this.state.lottieState = "idle";
        });
    }

    _updateLottieData(data, lottie) {
        if (!lottie || !data) return;
        for (let key of Object.keys(data)) {
            lottie.layers.forEach((layer) => {
                if (layer.nm === key) {
                    if ('refId' in layer) {
                        this._updateAssetsByRefid(lottie.assets, layer.refId, data[key]);
                    } else {
                        this._updateLayerText(layer, data[key])
                    }
                }
            })
        }
    }
}

export default FerrymanGraphic;
