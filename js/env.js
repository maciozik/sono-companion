const ENV = {
    DEV_MODE: true,
    APP: {
        NAME: "Sono Companion",
        VERSION: '', // Overridden asynchronously in core/init.js.
        VERSION_SUFFIX: '–dev',
        PWA_MODE: true // Overridden in core/init.js.
    },
    GITHUB: 'maciozik/sono-companion',
    URL: 'https://sono-companion.addmartigues.com/'
};

window.ENV = ENV;
