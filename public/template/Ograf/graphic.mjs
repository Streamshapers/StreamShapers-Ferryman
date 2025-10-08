/**
 * ┌─────────────────────────────────────────────┐
 * │   This OGraf template was created using     │
 * │   StreamShapers Ferryman ${version}        │
 * │   https://streamshapers.com                 │
 * └─────────────────────────────────────────────┘
 */

/**
 * The included Lottie Player is published under MIT License:
 *
 * MIT License
 *
 * Copyright (c) 2019 LottieFiles.com
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 */

/**
 * @typedef { import("https://ograf.ebu.io/v1/specification/javascript-types/index.d.ts").GraphicsAPI.Graphic } Graphic
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
            imagesPathPrefix: new URL("./lib/images/", import.meta.url).toString(),
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
            clocks: {},
            googleTableCells: null,
            fetchInterval: 0,
            lastRawUpdate: null,
            _googleTimers: []
        };
    }

    async load(loadParams) {
        const temp = document.createElement('div');
        temp.innerHTML = this._getReplacement("fontFaceStyles");
        const styleNode = temp.querySelector('style');
        if (styleNode) this.shadow.appendChild(styleNode);

        // Using local Lottie-Web (ESM) – equivalent to https://esm.sh/lottie-web@5.12.2
        const lottieModule = await import(import.meta.resolve("./lib/lottie-web.esm.mjs"));
        this.lottie = lottieModule.default;
        if (this.state.showLogs) console.log("Load params: ",loadParams);

        const url = import.meta.resolve("./lib/lottie-template.json");
        const response = await fetch(url);
        this.state.lottieTemplate = await response.json();
        const absBase = new URL("./lib/images/", import.meta.url).toString();
        for (const asset of (this.state.lottieTemplate.assets || [])) {
            if (asset.u && !/^https?:|^data:|^\//.test(asset.u)) {
                asset.u = absBase;
            }
        }
        this.state.lottieTemplateNew = JSON.parse(JSON.stringify(this.state.lottieTemplate));

        //fix and check markers
        this.state.lottieTemplate.markers.forEach((marker) => {
            const name = String(marker.cm || "").toLowerCase();
            marker.cm = name;
            this.state.markers.push(name);

            if (name.includes("next") && !name.includes("loop")) this.state.nextTotal++;
            if (name === "stop") this.state.stopExist = true;
            if (name === "update") this.state.updateExist = true;
        });

        //Google initial fetch
        this.state.googleTableCells = this._getReplacement("googleTableData");
        const fiEarly = this._getReplacement("fetchInterval");
        this.state.fetchInterval = Number.isFinite(+fiEarly) ? +fiEarly : 0;

        let initData = (loadParams && typeof loadParams === "object" && loadParams.data)
            ? { ...(loadParams.data || {}) }
            : {};

        if (this.state.fetchSheet && Array.isArray(await this._parseGoogleTable())) {
            initData = await this._updateGoogleTableData(initData);
        }

        this.state.data = initData;
        this._updateLottieData(this.state.data, this.state.lottieTemplateNew);

        //Clocks
        this.state.clocks = await this._parseClocks() || {};

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

        // Warte, bis der Player verfügbar ist //Noch zu Testen
        await new Promise(resolve => setTimeout(resolve, 100));

        // Google
        this.state.googleTableCells = this._getReplacement("googleTableData");
        this.state.fetchInterval = this._getReplacement("fetchInterval");
        const fi = this._getReplacement("fetchInterval");
        this.state.fetchInterval = Number.isFinite(+fi) ? +fi : 0;

        //periodic polling (mirrors HTML behavior)
        if (
            this.state.fetchInterval &&
            this.state.fetchInterval !== 0 &&
            this.state.googleTableCells &&
            this.state.googleTableCells !== "null" &&
            this.state.googleTableCells !== "[]"
        ) {
            const t1 = setTimeout(() => {
                const t2 = setInterval(() => {
                    if (this.state.lastRawUpdate) {
                        this.updateAction(this.state.lastRawUpdate);
                        if (this.state.showInfo) console.log("Periodically update triggered");
                    }
                }, this.state.fetchInterval);
                this.state._googleTimers.push(t2);
            }, 4000);
            this.state._googleTimers.push(t1);
        }


        // When everything is loaded we can return:
        return {};
    }

    async playAction(args = {}) {
        const { skipAnimation = false, delta = 1, goto: goToStep } = (args || {});

        let stepJustPlayed;

        if (!this.state.startPlayed) {
            await this.state.animLoaded.promise;
            if (this.state.showLogs) console.log("AnimLoaded");
            await this.state.animReady;
            if (this.state.showLogs) console.log("animReady");
            await this._loadFonts();
            if (this.state.clocks && Object.keys(this.state.clocks).length !== 0) {
                this._startClocks();
            }
            if (this.state.showLogs) console.log("fonts loaded");
        }

        const currentStep = this.state.startPlayed ? (this.state.nextCount - 1) : -1; // -1 bevor start
        const maxStep = this.state.nextTotal > 0 ? this.state.nextTotal : 0;

        let targetStep;
        if (typeof goToStep === "number") {
            targetStep = this._clamp(goToStep, 0, maxStep);
        } else if (typeof delta === "number" && currentStep >= 0) {
            targetStep = this._clamp(currentStep + delta, 0, maxStep);
        } else {
            targetStep = (this.state.startPlayed ? this._clamp(currentStep + 1, 0, maxStep) : 0);
        }

        if (this.state.startPlayed && targetStep === currentStep) {
            return { currentStep: currentStep };
        }

        if (!this.state.startPlayed) {
            this._playMarker("start", { skip: !!skipAnimation });
            this.state.playStatus = "play";
            this.state.currentSegment = "start";
            if (this.state.showLogs) console.log("Template - Play 'start' marker");
            if (this.state.markers.includes("start_loop")) this.state.playStack.push("start_loop");
            this.state.startPlayed = true;

            this.state.nextCount = 1;
            stepJustPlayed = 0;

        } else {
            if (targetStep === 0) {
                this._playMarker("start", { skip: !!skipAnimation });
                this.state.currentSegment = "start";
                if (this.state.markers.includes("start_loop")) this.state.playStack.push("start_loop");
                this.state.nextCount = 1;
                stepJustPlayed = 0;
            } else {
                const marker = this._stepToMarker(targetStep);
                if (this.state.lottieState === "idle") {
                    this._playMarker(marker, { skip: !!skipAnimation });
                    this.state.currentSegment = marker;
                    if (this.state.showLogs) console.log(`Template - Play '${marker}' Marker`);
                } else {
                    this.state.playStack.push(marker);
                    if (this.state.markers.includes(`${marker}_loop`)) this.state.playStack.push(`${marker}_loop`);
                }
                stepJustPlayed = targetStep;
                this.state.nextCount = targetStep + 1;
            }
        }

        return { currentStep: stepJustPlayed };
    }

    async stopAction(args = {}) {
        const { skipAnimation = false } = (args || {});
        if (this.state.stopExist) {
            if (this.state.lottieState === "idle") {
                if (skipAnimation) {
                    const m = this._getMarker("stop");
                    if (m) {
                        const endFrame = (m.tm + m.dr - 1);
                        this.state.animation.goToAndStop(endFrame, true);
                    } else {
                        this.state.animation.destroy();
                    }
                } else {
                    this.state.animation.goToAndPlay("stop", true);
                    if (this.state.showLogs) console.log("Template - Play 'stop' Marker");
                }
                this.state.nextCount = 1;
                this.state.startPlayed = false;
            } else {
                this.state.playStack.push("stop");
                this.state.nextCount = 1;
                this.state.startPlayed = false;
            }
        } else {
            if (this.state.showLogs) console.log("Template - No 'stop' marker - destroy Animation");
            this.state.nextCount = 1;
            this.state.startPlayed = false;
            this.state.animation.destroy();
        }
        this.state.playStatus = "stop";
        this._stopClocks();
        return {};
    }

    async updateAction(rawData) {
        if (this.state.lottieState !== "idle") console.log("Updating is not possible while Playing ");
        if (this.state.showLogs) console.log("Update triggered:", rawData);

        this.state.lottieTemplateUpdate = JSON.parse(JSON.stringify(this.state.lottieTemplateNew)); //copy the "old" updated template for the update Animation
        this.state.lottieTemplateNew = JSON.parse(JSON.stringify(this.state.lottieTemplate));
        let parsed;

        if (rawData) {
            parsed = rawData;
        }

        if (this.state.fetchSheet && Array.isArray(await this._parseGoogleTable())) {
            const payloadObj = (parsed && typeof parsed === "object" && parsed.data) ? { ...(parsed.data || {}) } : { ...(parsed || {}) };
            const merged = await this._updateGoogleTableData(payloadObj);

            if (parsed && typeof parsed === "object" && "data" in parsed) {
                parsed.data = merged;
            } else {
                parsed = { data: merged };
            }
        }

        if (parsed) {
            for (let key of Object.keys(parsed.data)) {
                this.state.data[key] = parsed.data[key];
            }
        }

        this.state.lastRawUpdate = parsed;

        if (this.state.data) {
            for (let key of Object.keys(this.state.data)) {
                if (key === "_templateInfo") this.state.showInfo = true;
                if (key === "_debug") this.state.showLogs = true;
                if (key === "epochID") {
                    this.state.imagesQuery = `?epoch=${encodeURIComponent(this.state.data[key])}`;
                }
                if (key === "_stopFetch") this.state.fetchSheet = false;
            }
            this._updateLottieData(this.state.data, this.state.lottieTemplateNew);
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

                this.state.updateAnimation.addEventListener("DOMLoaded", async () => {
                    if (this.state.clocks && Object.keys(this.state.clocks).length) {
                        this._updateClocksOn(this.state.updateAnimation);
                    }
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
                            if (this.state.clocks && Object.keys(this.state.clocks).length) {
                                this._updateClocksOn(this.state.newAnimation);
                            }
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
                    if (this.state.clocks && Object.keys(this.state.clocks).length) {
                        this._updateClocksOn(this.state.newAnimation);
                    }
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
                                this.state.currentSegmentFrames = marker.tm; //??
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
        try {
            this.state.updateAnimation?.destroy?.();
            this.state.newAnimation?.destroy?.();
            this.state.animation?.destroy?.();

            (this.state._googleTimers || []).forEach(id => clearInterval(id));
            this.state._googleTimers = [];
            (this.state.clockIntervalIds || []).forEach(id => clearInterval(id));
            this.state.clockIntervalIds = [];
        } catch {}
        this.shadow.innerHTML = "";
        return {};
    }


    async getStatus(_params) {
        return {
            playStatus: this.state.playStatus,     // "play" | "stop" | "loaded"
            currentSegment: this.state.currentSegment || null,
            currentStep: this.state.startPlayed ? (this.state.nextCount - 1) : -1,
            lottieState: this.state.lottieState,   // "play" | "idle"
        }
    }


    async customAction(params) {
        return {};

    }

    async goToTime(payload) {
        if (!payload || typeof payload.seconds !== "number") return {};
        const frame = Math.round(payload.seconds * this.state.animation.frameRate);
        this.state.animation.goToAndStop(frame, true);
        return { frame };
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

    _updateAssetsByRefid(assets, id, value) {
        const onlyFile = (s) => String(s).split("?")[0].split("#")[0].split("/").pop();
        const a = assets.find(x => x.id === id);
        if (!a) return;

        const base = new URL("./lib/images/", import.meta.url).toString();
        const file = onlyFile(value);

        a.u = base;                                   // base path only
        a.p = file + (this.state.imagesQuery || "");  // append ?epoch=... to the filename
        a.e = 0;
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
                this.state.playStack = [];
                this.state.animation.destroy();
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
            const m = this._getMarker(this.state.currentSegment);
            this.state.currentSegmentFrames = m ? m.tm : 0;
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

    _stepToMarker(step) {
        if (step <= 0) return "start";
        return "next" + step;
    }

    _clamp(n, min, max) { return Math.min(Math.max(n, min), max); }

    _playMarker(markerName, { skip = false } = {}) {
        if (!markerName) return;

        if (!skip) {
            this.state.animation.goToAndPlay(markerName, true);
            this.state.lottieState = "play";
            return;
        }

        const m = this._getMarker(markerName);
        if (!m) return;

        const endFrame = (m.tm + m.dr - 1);
        this.state.animation.goToAndStop(endFrame, true);
        this.state.lottieState = "idle";
    }

    async _parseGoogleTable() {
        const cfg = this.state.googleTableCells;
        if (!cfg) return null;

        if (Array.isArray(cfg)) return cfg;
        if (typeof cfg === "object") return cfg;

        if (typeof cfg === "string") {
            const trimmed = cfg.trim();
            if (!trimmed || trimmed === "null" || trimmed === "[]") return null;
            try { return JSON.parse(trimmed); } catch { return null; }
        }
        return null;
    }


    async _fetchDataFromGoogle(url) {
        try {
            const resp = await fetch(url);
            if (!resp.ok) {
                console.warn(`Error on fetching googlesheets data. Status: ${resp.status}`);
                return null;
            }
            const tsv = await resp.text();
            return tsv.split("\n").map(row => row.split("\t"));
        } catch (err) {
            console.error("Error collecting data from Google:", err);
            return null;
        }
    }

    _getCellData(a1, data) {
        try {
            const colLetters = a1.match(/[A-Z]+/g)[0];
            const base = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
            let rowIx = parseInt(a1.match(/[0-9]+/g)[0], 10) - 1;
            let colIx = 0;
            for (let i = 0; i < colLetters.length; i++) {
                colIx = colIx * 26 + base.indexOf(colLetters[i]) + 1;
            }
            colIx -= 1;

            let cellValue = data[rowIx] ? data[rowIx][colIx] : undefined;
            if (cellValue && cellValue.startsWith('"') && cellValue.endsWith('"')) {
                cellValue = cellValue.slice(1, -1);
            }
            if (cellValue) {
                cellValue = cellValue.replace(/\r/g, "").replace(/\n/g, "");
            }
            return cellValue;
        } catch (e) {
            console.log("Error getCellData from GoogleSheet:", e);
        }
    }

    async _updateGoogleTableData(dataObj) {
        try {
            let data = (dataObj && typeof dataObj === "object") ? { ...dataObj } : {};
            const tableCfg = await this._parseGoogleTable();
            if (!Array.isArray(tableCfg) || tableCfg.length === 0) return data;

            const sources = {};
            for (const element of tableCfg) {
                const sheetURL = `https://docs.google.com/spreadsheets/d/${element.id}/export?format=tsv&gid=${element.sheet}`;
                let tsvArray = sources[sheetURL];
                if (!tsvArray) {
                    tsvArray = await this._fetchDataFromGoogle(sheetURL);
                    sources[sheetURL] = tsvArray;
                }
                if (tsvArray && tsvArray.length > 0) {
                    const value = this._getCellData(element.cell, tsvArray);
                    data[element.key] = value;
                }
            }
            return data;
        } catch (e) {
            console.log(e);
            return dataObj || {};
        }
    }

    async _parseClocks() {
        const cfg = this._getReplacement("clocks");
        if (!cfg) return null;

        if (typeof cfg === "object") return cfg;
        if (typeof cfg === "string") {
            const t = cfg.trim();
            if (!t || t === "null" || t === "{}") return null;
            try { return JSON.parse(t); } catch { return null; }
        }
        return null;
    }

    _getTime(type, addSeconds = 0) {
        const formats = {
            clock1: { hour: "2-digit", minute: "2-digit", hour12: false },
            clock2: { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false },
            clock3: { hour: "2-digit", minute: "2-digit", hour12: true },
            clock4: { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true },
            clock5: { hour: "2-digit", minute: "2-digit", hour12: true },
            clock6: { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true },
        };
        const now = new Date();
        now.setSeconds(now.getSeconds() + (addSeconds || 0));
        let out = new Intl.DateTimeFormat("en-GB", formats[type] || formats.clock1).format(now);
        if (type === "clock5" || type === "clock6") out = out.replace(/\s?(AM|PM)$/i, "");
        return out;
    }

    _updateClocksOn(animation) {
        if (!animation || !animation.isLoaded || !this.state.clocks) return;
        const clocks = this.state.clocks;
        Object.keys(clocks).forEach((clk) => {
            const time = this._getTime(clk);
            const layers = clocks[clk] || [];
            const renderer = animation.renderer;
            if (!renderer || !renderer.elements) return;
            renderer.elements.forEach((el) => {
                if (el && el.data && el.data.nm && typeof el.updateDocumentData === "function") {
                    if (layers.includes(el.data.nm)) el.updateDocumentData({ t: time });
                }
            });
        });

        if (this.state.lottieState === "idle") {
            let saveFrame = animation.currentFrame + (this.state.currentSegmentFrames || 0);
            if (animation.getDuration(1) === this.state.lottieTemplate.op || (this.state.currentSegmentFrames || 0) === 0) {
                saveFrame = animation.currentFrame;
            }
            if (animation.renderer && typeof animation.renderer.renderFrame === "function") {
                try {
                    animation.renderer.renderFrame(saveFrame + 1);
                    animation.renderer.renderFrame(saveFrame);
                } catch (e) {
                    console.warn("Clock re-render error:", e);
                }
            }
        }
    }

    _startClocks() {
        if (!this.state.clocks || Object.keys(this.state.clocks).length === 0) return;

        (this.state.clockIntervalIds || []).forEach(id => clearInterval(id));
        this.state.clockIntervalIds = [];

        const id = setInterval(() => {
            this._updateClocksOn(this.state.animation);
            this._updateClocksOn(this.state.newAnimation);
            this._updateClocksOn(this.state.updateAnimation);
        }, 100);
        this.state.clockIntervalIds.push(id);

        this._updateClocksOn(this.state.animation);
        this._updateClocksOn(this.state.newAnimation);
        this._updateClocksOn(this.state.updateAnimation);
    }

    _stopClocks() {
        (this.state.clockIntervalIds || []).forEach(id => clearInterval(id));
        this.state.clockIntervalIds = [];
    }
}

export default FerrymanGraphic;
