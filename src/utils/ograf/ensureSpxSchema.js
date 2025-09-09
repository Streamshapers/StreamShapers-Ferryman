export function ensureSpxSchema(manifest, refImagesList = []) {
    const out = JSON.parse(JSON.stringify(manifest || {}));

    // Top-level v_spx Defaults
    out.v_spx = {
        playserver: out.v_spx?.playserver ?? "OVERLAY",
        playchannel: out.v_spx?.playchannel ?? "1",
        playlayer: out.v_spx?.playlayer ?? "1",
        webplayout: out.v_spx?.webplayout ?? "1",
        out: out.v_spx?.out ?? "manual",
        uicolor: out.v_spx?.uicolor ?? "4",
    };

    if (out.vendors) delete out.vendors;

    out.schema = out.schema && typeof out.schema === "object" ? out.schema : { type: "object", properties: {} };
    out.schema.properties =
        out.schema.properties && typeof out.schema.properties === "object" ? out.schema.properties : {};

    const imageKeys = new Set(
        (refImagesList || []).map(x => (typeof x === "string" ? x : x?.nm)).filter(Boolean)
    );

    const assetfolder = "./lib/images/";

    for (const [key, def] of Object.entries(out.schema.properties)) {
        if (!def || typeof def !== "object") continue;

        if (imageKeys.has(key)) {
            const defPath = typeof def.default === "string" ? def.default : "";
            const filename = defPath.split("?")[0].split("#")[0].split("/").pop() || "";
            const ext = (filename.split(".").pop() || "").toLowerCase();
            const safeExt = ["png","jpg","jpeg","webp","gif","svg","json","css"].includes(ext) ? ext : "png";

            out.schema.properties[key] = {
                ...def,
                type: "string",
                default: filename ? assetfolder + filename : def.default,
                v_spx: {
                    ftype: "filelist",
                    assetfolder,
                    extension: safeExt
                }
            };
        }
    }

    return out;
}
