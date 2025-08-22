'use strict';

import './env.js';

/**  CORE  **/
import * as History from './core/history.js';
import * as WakeLock from './core/wake-lock.js';

/**  UTILS  **/
import './utils/window/doubleRequestAnimationFrame.js';
import './utils/htmlelement/addClassTemporarily.js';
import './utils/htmlelement/addDynamicEventListener.js';
import './utils/htmlelement/getCssProperty.js';
import './utils/math/roundFloat.js';
import './utils/math/clamp.js';
import './utils/math/float.js';
import './utils/number/addZeros.js';
import './utils/app.vibrate.js';
import './utils/console/debugType.js';

/**  CUSTOM ELEMENTS  **/
import './custom-elements/SettingSwitch.js';
import './custom-elements/SettingList.js';
import './custom-elements/SettingRange.js';
import './custom-elements/SettingAction.js';
import './custom-elements/GIcon.js';
import './custom-elements/IncludeHTML.js';

/**  COMPONENTS  **/
import * as NavTab from './components/nav-tab.js';
import * as PlayBtn from './components/play-btn.js';
import './components/scrollbar.js';
import './components/tappable.js';

/**  VIEWS  **/
import * as View from './views/view.js';
import * as Sonometer from './views/sonometer.js';
import * as Tempo from './views/tempo.js';
import * as Settings from './views/settings.js';

/**  WIDGETS  **/
import * as Gauge from './widgets/gauge.js';
import * as Metronome from './widgets/metronome.js';
import * as BpmManager from './widgets/bpm-manager.js';

/**  APP  **/

// Run the service worker.
if ('serviceWorker' in navigator && !ENV.DEV_MODE) {
    navigator.serviceWorker.register('js/core/service-worker.js')
        .then(registration => console.debug("Service Worker registered:", registration))
        .catch(error => console.error("Service Worker not registered:", error));
}

// Lock the portrait orientation on PWA or fullscreen mode.
if (screen.orientation) {
    screen.orientation.lock("portrait")
        .catch(error => console.warn(error.message));
}

// Prevent the context menu.
if (!ENV.DEV_MODE) {
    document.addEventListener("contextmenu", event => event.preventDefault());
}

// Get the current version from GitHub tags.
window.fetch(`https://api.github.com/repos/${ENV.GITHUB}/tags`)
    .then(response => {
        if (!response.ok) throw new Error(`HTTP error ${response.status}.`);
        return response.json();
    })
    .then(tags => {
        const $version = document.querySelector('setting-action[data-name=version] .setting-info');
        const $credits = document.querySelector('.app-credits .app-version');
        let version = tags?.[0]?.name?.replace(/^v/, "");

        $version.textContent = version + ENV.APP.VERSION_SUFFIX;
        $credits.textContent = "v" + version;
        ENV.APP.VERSION = version;
    })
    .catch(error => console.error(error));

/**  MODULES  **/

const modules = {
    Settings,
    History,
    WakeLock,
    View,
    PlayBtn,
    NavTab,
    Sonometer,
    Gauge,
    Tempo,
    Metronome,
    BpmManager
};

// Call the __init__ function of each module by passing them all modules reference.
for (const module of Object.values(modules)) {
    if (typeof module.__init__ === 'function') {
        module.__init__(modules);
    }
}
