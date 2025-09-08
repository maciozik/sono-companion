const ENV = {

    PROD: false,

    APP: {
        NAME: "Sono Companion",
        VERSION: '', // Initialized asynchronously in init.js.
        VERSION_SUFFIX: '–dev',
        PWA_MODE: true, // Initialized in init.js.

        /** @type {'all'|'warn'|'error'|'none'} */
        DEBUG: 'all',
    },

    GITHUB: 'maciozik/sono-companion',
    URL: 'https://sono-companion.addmartigues.com/',
};

window.ENV = ENV;
