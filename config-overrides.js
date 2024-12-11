module.exports = function override(config, env) {
    const fontLoader = config.module.rules.find(rule => rule.oneOf).oneOf.find(r => r.test && r.test.toString().includes('ttf'));
    if (fontLoader) {
        fontLoader.options.esModule = false;
    }
    return config;
};
