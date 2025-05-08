// graphic.mjs – Ferryman-kompatibles Ograf-Template mit bodymovin, Markern, Daten-Update, Zeitfeld

/**
 * @typedef { import("https://ograf.ebu.io/v1-draft-0/specification/javascript-types/index.d.ts").GraphicsAPI.Graphic } Graphic
 */

/** @implements {Graphic} */
class FerrymanGraphic extends HTMLElement {
    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
        this.state = {
            lottieData: null,
            animation: null,
            updateCounter: 1,
            currentSegment: 'start',
            playStack: [],
            lottieState: 'idle',
        };
    }

    async load({ data }) {
        this.shadow.innerHTML = `<div id="animation1"></div>`;

        // Load bodymovin
        const { default: bodymovin } = await import("https://cdn.jsdelivr.net/npm/lottie-web/build/player/lottie.min.js");
        console.log(bodymovin);
        this.bodymovin = bodymovin;

        // Load Lottie template
        this.state.lottieData = await this._loadLottieData();
        this.state.animation = this._createAnimation(this.state.lottieData, 'animation1');

        // Render first frame
        await this._waitForReady(this.state.animation);
        this.state.animation.goToAndStop(0, true);
    }

    async playAction() {
        const anim = this.state.animation;
        anim.goToAndPlay('start', true);
        this.state.currentSegment = 'start';
        this.state.lottieState = 'play';
    }

    async stopAction() {
        const anim = this.state.animation;
        if (this._hasMarker('stop')) {
            anim.goToAndPlay('stop', true);
        } else {
            anim.destroy();
        }
        this.state.lottieState = 'stop';
    }

    async dispose(_params) {
        this.innerHTML = "";
        this.g = null;
    }

    async getStatus(_params) {
        return {};
    }

    async customAction(params) {
        // params.id
        // params.payload
    }

    async goToTime(payload) {
    }

    async setActionsSchedule(payload) {

    }

    async updateAction({ data }) {
        const updated = this._applyDataToLottie(this.state.lottieData, data);

        const id = ++this.state.updateCounter;
        const containerId = `animation${id}`;
        const container = document.createElement('div');
        container.id = containerId;
        this.shadow.appendChild(container);

        const anim = this._createAnimation(updated, containerId);
        await this._waitForReady(anim);

        this.state.animation.destroy();
        this.state.animation = anim;
    }

    _createAnimation(data, containerId) {
        return this.bodymovin.loadAnimation({
            container: this.shadow.getElementById(containerId),
            renderer: "svg",
            loop: false,
            autoplay: false,
            animationData: data,
        });
    }

    _applyDataToLottie(template, data) {
        const updated = JSON.parse(JSON.stringify(template));
        for (const key in data) {
            updated.layers?.forEach(layer => {
                if (layer.nm === key && layer.t?.d?.k?.[0]?.s?.t) {
                    layer.t.d.k[0].s.t = data[key];
                }
            });
        }
        return updated;
    }

    async _loadLottieData() {
        // TODO: Replace with dynamic or embedded JSON
        return {
            "v": "5.7.4",
            "fr": 30,
            "ip": 0,
            "op": 90,
            "layers": [
                {
                    "nm": "name",
                    "t": { "d": { "k": [{ "s": { "t": "John Doe" } }] } }
                },
                {
                    "nm": "title",
                    "t": { "d": { "k": [{ "s": { "t": "Expert" } }] } }
                }
            ]
        };
    }

    async _waitForReady(animation) {
        return new Promise(resolve => {
            animation.addEventListener("DOMLoaded", () => resolve());
        });
    }

    _hasMarker(name) {
        return this.state.lottieData.markers?.some(m => m.cm === name);
    }
}

export default FerrymanGraphic;
