import React, { useContext, useMemo, useRef, useEffect } from "react";
import { GlobalStateContext } from "../../Context/GlobalStateContext";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faRotateRight } from "@fortawesome/free-solid-svg-icons";

const Row = ({ children }) => <div className="ogf-row">{children}</div>;
const Label = ({ children }) => <label className="ogf-label">{children}</label>;
const Input = ({ className = "", ...props }) => (
    <input {...props} className={`ogf-input ${className}`.trim()} />
);
const Checkbox = ({ checked, onChange, className = "" }) => (
    <input
        type="checkbox"
        checked={!!checked}
        onChange={(e) => onChange(e.target.checked)}
        className={`ogf-checkbox ${className}`.trim()}
    />
);

function OgrafExport() {
    const {
        ografManifest,
        setOgrafManifest,
        ografAutoSync,
        setOgrafAutoSync,
    } = useContext(GlobalStateContext);

    // Fallback if manifest is not yet set (normally provided by context)
    const m = useMemo(
        () =>
            ografManifest || {
                $schema: "https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json",
                id: "graphic",
                version: "1.0.0",
                name: "Graphic",
                main: "graphic.mjs",
                supportsRealTime: true,
                supportsNonRealTime: false,
                stepCount: 1,
                schema: { type: "object", properties: {} },
            },
        [ografManifest]
    );

    // Baseline (first manifest in this tab) for reset reference
    const baselineRef = useRef(null);
    useEffect(() => {
        const currentId = (ografManifest && ografManifest.id) || "graphic";
        if (!baselineRef.current || baselineRef.current.__baselineId !== currentId) {
            baselineRef.current = {
                __baselineId: currentId,
                snapshot: JSON.parse(JSON.stringify(m)),
            };
        }
    }, [ografManifest?.id, m]);

    const deepClone = (v) => JSON.parse(JSON.stringify(v));

    const update = (path, value) => {
        setOgrafManifest((prev) => {
            const base = prev || m;
            const next = deepClone(base);
            const seg = path.split(".");
            let t = next;
            for (let i = 0; i < seg.length - 1; i++) {
                const k = seg[i];
                if (t[k] == null || typeof t[k] !== "object") {
                    t[k] = Number.isInteger(Number(seg[i + 1])) ? [] : {};
                }
                t = t[k];
            }
            t[seg.at(-1)] = value;
            return next;
        });
    };

    const getAt = (obj, path) => {
        if (!obj) return undefined;
        const seg = path.split(".");
        let t = obj;
        for (const k of seg) {
            const idx = Number.isInteger(Number(k)) ? Number(k) : k;
            if (t == null || !(idx in t)) return undefined;
            t = t[idx];
        }
        return t;
    };

    const resetField = (path, fallbackValue) => {
        const base = baselineRef.current?.snapshot;
        const baseVal = getAt(base, path);
        if (base && baseVal !== undefined) {
            update(path, deepClone(baseVal));
        } else {
            update(path, fallbackValue);
        }
    };

    const ensureSchema = () => {
        if (!m.schema) update("schema", { type: "object", properties: {} });
        if (!m.schema?.properties) update("schema.properties", {});
    };

    const addProperty = () => {
        ensureSchema();
        const key = prompt("New field (e.g., _title):");
        if (!key) return;
        if (m.schema.properties?.[key]) {
            alert("Field already exists.");
            return;
        }
        update("schema.properties", {
            ...(m.schema.properties || {}),
            [key]: { type: "string", title: key.replace(/^_/, ""), default: "" },
        });
    };

    const rmProperty = (k) => {
        const copy = { ...(m.schema.properties || {}) };
        delete copy[k];
        update("schema.properties", copy);
        if (Array.isArray(m.required) && m.required.includes(k)) {
            update(
                "required",
                m.required.filter((x) => x !== k)
            );
        }
    };

    const toggleRequired = (k, on) => {
        const req = new Set(m.required || []);
        on ? req.add(k) : req.delete(k);
        update("required", Array.from(req));
    };

    const setProp = (k, field, v) => {
        update(`schema.properties.${k}`, { ...(m.schema.properties?.[k] || {}), [field]: v });
    }

    const hiddenPropsRef = useRef({});

    const currentProps = m.schema?.properties || {};
    const disabledProps = hiddenPropsRef.current || {};
    const allPropKeys = Array.from(new Set([
        ...Object.keys(currentProps),
        ...Object.keys(disabledProps),
    ])).sort();

    const isRequired = (key) => Array.isArray(m.required) && m.required.includes(key);

    const includeToggle = (key, on) => {
        if (on) {
            // Re-enable: restore previous def or a sensible default
            const def = disabledProps[key] || { type: "string", title: key.replace(/^_/, ""), default: "" };
            update(`schema.properties.${key}`, def);
            delete hiddenPropsRef.current[key];
        } else {
            // Disable: move current def to hidden, remove from manifest + required
            const def = currentProps[key];
            if (def) hiddenPropsRef.current[key] = def;

            if (isRequired(key)) {
                update("required", (m.required || []).filter((x) => x !== key));
            }

            const copy = { ...currentProps };
            delete copy[key];
            update("schema.properties", copy);
        }
    };

    // RenderRequirements helpers (reset per sub-field)
    const rr = Array.isArray(m.renderRequirements) ? m.renderRequirements[0] : undefined;
    const baseRR = Array.isArray(baselineRef.current?.snapshot?.renderRequirements)
        ? baselineRef.current.snapshot.renderRequirements[0]
        : undefined;

    const setRenderReq = (arr) => update("renderRequirements", arr);

    const resetRRField = (field) => {
        const next = { ...(rr || {}) };
        if (field === "width") {
            const baseW = baseRR?.resolution?.width;
            if (baseW) {
                next.resolution = { ...(next.resolution || {}), width: deepClone(baseW), height: next.resolution?.height };
            } else if (next.resolution) {
                delete next.resolution.width;
                if (!next.resolution.height) delete next.resolution;
            }
        }
        if (field === "height") {
            const baseH = baseRR?.resolution?.height;
            if (baseH) {
                next.resolution = { ...(next.resolution || {}), height: deepClone(baseH), width: next.resolution?.width };
            } else if (next.resolution) {
                delete next.resolution.height;
                if (!next.resolution.width) delete next.resolution;
            }
        }
        if (field === "fr") {
            const baseFr = baseRR?.frameRate;
            if (baseFr) next.frameRate = deepClone(baseFr);
            else delete next.frameRate;
        }
        if (field === "net") {
            const baseNet = baseRR?.accessToPublicInternet;
            if (baseNet) next.accessToPublicInternet = deepClone(baseNet);
            else delete next.accessToPublicInternet;
        }
        setRenderReq([next]);
    };

    // Work with array safely
    const rrArr = Array.isArray(m.renderRequirements) ? m.renderRequirements : [];

    // resolution
    const rrResIndex = rrArr.findIndex(o => o && o.resolution);
    const rrRes = rrResIndex >= 0 ? rrArr[rrResIndex].resolution : undefined;
    const resW = rrRes?.width?.exact ?? "";
    const resH = rrRes?.height?.exact ?? "";

    // frameRate
    const rrFrIndex = rrArr.findIndex(o => o && o.frameRate);
    const frEx = rrFrIndex >= 0 ? (rrArr[rrFrIndex].frameRate?.exact ?? "") : "";

    // internet
    const rrNetIndex = rrArr.findIndex(o => o && o.accessToPublicInternet);
    const internetExact = rrNetIndex >= 0 ? rrArr[rrNetIndex].accessToPublicInternet?.exact : undefined;


    return (
        <div className="tab-content ograf-tab">
            {/* Header stays as-is */}
            <div className="export-checkbox ograf-header">
                <h2>OGraf Export Settings</h2>
                <a href="https://ograf.ebu.io/" target="_blank" rel="noreferrer">
                    <img className="ograf-logo" src="./ograf-logo-colour.png" alt="Ograf Logo" />
                </a>
            </div>

            {/* Manifest basics */}
            {/*<Row>
                <Label>$schema</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.$schema || ""} onChange={(e) => update("$schema", e.target.value)} />
                    <button
                        className="ogf-reset-btn"
                        title="Reset"
                        onClick={() =>
                            resetField("$schema", "https://ograf.ebu.io/v1/specification/json-schemas/graphics/schema.json")
                        }
                    >
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>*/}

            <Row>
                <Label>id</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.id || ""} onChange={(e) => update("id", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("id", "graphic")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>name</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.name || ""} onChange={(e) => update("name", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("name", "Graphic")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>version</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.version || ""} onChange={(e) => update("version", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("version", "1.0.0")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>description</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.description || ""} onChange={(e) => update("description", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("description", "")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>author.name</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.author?.name || ""} onChange={(e) => update("author.name", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("author.name", "")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>author.email</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.author?.email || ""} onChange={(e) => update("author.email", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("author.email", "")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>author.url</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.author?.url || ""} onChange={(e) => update("author.url", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("author.url", "")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            {/*<Row>
                <Label>main</Label>
                <div className="ogf-input-wrap">
                    <Input value={m.main || "graphic.mjs"} onChange={(e) => update("main", e.target.value)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("main", "graphic.mjs")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>*/}

            <Row>
                <Label>supportsRealTime</Label>
                <div className="ogf-input-wrap">
                    <Checkbox checked={m.supportsRealTime} onChange={(v) => update("supportsRealTime", v)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("supportsRealTime", true)}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>supportsNonRealTime</Label>
                <div className="ogf-input-wrap">
                    <Checkbox checked={m.supportsNonRealTime} onChange={(v) => update("supportsNonRealTime", v)} />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("supportsNonRealTime", false)}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            {/*<Row>
                <Label>stepCount</Label>
                <div className="ogf-input-wrap">
                    <Input
                        type="number"
                        min={0}
                        value={Number(m.stepCount || 1)}
                        onChange={(e) => update("stepCount", Number(e.target.value || 0))}
                    />
                    <button className="ogf-reset-btn" title="Reset" onClick={() => resetField("stepCount", 1)}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>*/}

            <hr className="ogf-hr" />
            <h4 className="ogf-subtitle">Render Requirements</h4>

            {/* Resolution (exact) – Width */}
            <Row>
                <Label>Resolution width</Label>
                <div className="ogf-input-wrap">
                    <Input
                        placeholder="width (px)"
                        type="number"
                        value={resW}
                        onChange={(e) => {
                            const v = e.target.value;
                            const next = rrArr.map(o => ({ ...o }));
                            const idx = rrResIndex >= 0 ? rrResIndex : (next.push({}), next.length - 1);

                            const res = { ...(next[idx].resolution || {}) };
                            if (v === "") {
                                delete res.width;
                            } else {
                                res.width = { exact: Number(v) };
                            }

                            if (!res.width && !res.height) {
                                delete next[idx].resolution;
                                if (Object.keys(next[idx]).length === 0) next.splice(idx, 1);
                            } else {
                                next[idx].resolution = res;
                            }

                            setRenderReq(next);
                        }}
                    />
                    <button className="ogf-reset-btn" title="Reset width" onClick={() => resetRRField("width")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            {/* Resolution (exact) – Height */}
            <Row>
                <Label>Resolution height</Label>
                <div className="ogf-input-wrap">
                    <Input
                        placeholder="height (px)"
                        type="number"
                        value={resH}
                        onChange={(e) => {
                            const v = e.target.value;
                            const next = rrArr.map(o => ({ ...o }));
                            const idx = rrResIndex >= 0 ? rrResIndex : (next.push({}), next.length - 1);

                            const res = { ...(next[idx].resolution || {}) };
                            if (v === "") {
                                delete res.height;
                            } else {
                                res.height = { exact: Number(v) };
                            }

                            if (!res.width && !res.height) {
                                delete next[idx].resolution;
                                if (Object.keys(next[idx]).length === 0) next.splice(idx, 1);
                            } else {
                                next[idx].resolution = res;
                            }

                            setRenderReq(next);
                        }}
                    />
                    <button className="ogf-reset-btn" title="Reset height" onClick={() => resetRRField("height")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>


            <Row>
                <Label>FrameRate</Label>
                <div className="ogf-input-wrap">
                    <Input
                        placeholder="e.g., 50"
                        type="number"
                        value={frEx}
                        onChange={(e) => {
                            const v = e.target.value;
                            const next = rrArr.map(o => ({ ...o }));
                            const idx = rrFrIndex;

                            if (v === "") {
                                // clear framerate
                                if (idx >= 0) {
                                    const obj = { ...next[idx] };
                                    delete obj.frameRate;
                                    if (Object.keys(obj).length === 0) next.splice(idx, 1);
                                    else next[idx] = obj;
                                }
                            } else {
                                const val = { exact: Number(v) };
                                if (idx >= 0) next[idx] = { ...next[idx], frameRate: val };
                                else next.push({ frameRate: val });
                            }
                            setRenderReq(next);
                        }}
                    />

                    <button className="ogf-reset-btn" title="Reset (Framerate)" onClick={() => resetRRField("fr")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <Row>
                <Label>Internet required?</Label>
                <div className="ogf-input-wrap">
                    <Checkbox
                        checked={internetExact === true}
                        onChange={(v) => {
                            const newRR = { ...(rr || {}) };
                            newRR.accessToPublicInternet = v ? { exact: true } : undefined;
                            setRenderReq([newRR]);
                        }}
                    />
                    <button className="ogf-reset-btn" title="Reset (Internet)" onClick={() => resetRRField("net")}>
                        <FontAwesomeIcon icon={faRotateRight} />
                    </button>
                </div>
            </Row>

            <hr className="ogf-hr" />
            <h4 className="ogf-subtitle">Schema (Data Model)</h4>

            {/* Header with Include column */}
            <div className="ogf-props-grid ogf-props-header ogf-props-grid--with-include">
                <div>Use</div>
                <div>Key</div>
                <div>Type</div>
                <div>Title</div>
                <div>Default</div>
            </div>

            {allPropKeys.map((k) => {
                const def = currentProps[k] || disabledProps[k] || { type: "string" };
                const included = !!currentProps[k];

                const baseProp = baselineRef.current?.snapshot?.schema?.properties?.[k];
                const baseReq = Array.isArray(baselineRef.current?.snapshot?.required)
                    ? baselineRef.current.snapshot.required.includes(k)
                    : false;

                const resetPropField = (field, fallbackFactory) => {
                    if (baseProp && baseProp[field] !== undefined) {
                        setProp(k, field, deepClone(baseProp[field]));
                    } else {
                        setProp(k, field, fallbackFactory());
                    }
                };

                return (
                    <div
                        key={k}
                        className={`ogf-props-grid ogf-props-row ogf-props-grid--with-include ${included ? "" : "is-disabled"}`}
                    >
                        {/* Include toggle (always active) */}
                        <div className="ogf-include-cell">
                            <Checkbox checked={included} onChange={(v) => includeToggle(k, v)} />
                        </div>

                        {/* Key */}
                        <div className="ogf-prop-key">
                            <code>{k}</code>
                        </div>

                        {/* Type */}
                        <div className="ogf-input-wrap">
                            <select
                                value={def.type || "string"}
                                onChange={(e) => setProp(k, "type", e.target.value)}
                                className="ogf-select"
                                disabled={!included}
                            >
                                <option>string</option>
                                <option>number</option>
                                <option>integer</option>
                                <option>boolean</option>
                            </select>
                            <button
                                className="ogf-reset-btn"
                                title="Reset type"
                                onClick={() => resetPropField("type", () => "string")}
                                disabled={!included}
                            >
                                <FontAwesomeIcon icon={faRotateRight} />
                            </button>
                        </div>

                        {/* Title */}
                        <div className="ogf-input-wrap">
                            <Input
                                value={def.title || ""}
                                onChange={(e) => setProp(k, "title", e.target.value)}
                                disabled={!included}
                            />
                            <button
                                className="ogf-reset-btn"
                                title="Reset title"
                                onClick={() => resetPropField("title", () => k.replace(/^_/, ""))}
                                disabled={!included}
                            >
                                <FontAwesomeIcon icon={faRotateRight} />
                            </button>
                        </div>

                        {/* Default */}
                        <div className="ogf-input-wrap">
                            <Input
                                value={def.default ?? ""}
                                onChange={(e) => setProp(k, "default", e.target.value)}
                                disabled={!included}
                            />
                            <button
                                className="ogf-reset-btn"
                                title="Reset default"
                                onClick={() => resetPropField("default", () => "")}
                                disabled={!included}
                            >
                                <FontAwesomeIcon icon={faRotateRight} />
                            </button>
                        </div>
                    </div>
                );
            })}


            <hr className="ogf-hr" />
            <details className="ogf-details">
                <summary>JSON Preview</summary>
                <pre className="ogf-json-preview">
{JSON.stringify(m, null, 2)}
        </pre>
            </details>
        </div>
    );
}

export default OgrafExport;
