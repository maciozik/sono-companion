'use strict';

import '/js/env.js';

/**  UTILS  **/
import '/js/utils/app.vibrate.js';
import '/js/utils/window/doubleRequestAnimationFrame.js';
import '/js/utils/htmlelement/addClassTemporarily.js';
import '/js/utils/htmlelement/addDynamicEventListener.js';
import '/js/utils/htmlelement/getCssProperty.js';
import '/js/utils/number/addZeros.js';
import '/js/utils/math/roundFloat.js';
import '/js/utils/math/clamp.js';
import '/js/utils/math/float.js';
import '/js/utils/console/debugType.js';

/**  CORE  **/
import * as History from '/js/core/history.js';
import * as WakeLock from '/js/core/wake-lock.js';

/**  CUSTOM ELEMENTS  **/
import '/js/custom-elements/SettingSwitch.js';
import '/js/custom-elements/SettingList.js';
import '/js/custom-elements/SettingRange.js';
import '/js/custom-elements/SettingAction.js';
import '/js/custom-elements/GIcon.js';
import '/js/custom-elements/IncludeHTML.js';

/**  VIEWS  **/
import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';
import * as Sonometer from '/js/views/sonometer.js';
import * as Tempo from '/js/views/tempo.js';

/**  WIDGETS  **/
import * as Gauge from '/js/widgets/gauge.js';
import * as Metronome from '/js/widgets/metronome.js';
import * as BpmManager from '/js/widgets/bpm-manager.js';

/**  COMPONENTS  **/
import * as NavTab from '/js/components/nav-tab.js';
import * as PlayBtn from '/js/components/play-btn.js';
import '/js/components/scrollbar.js';
import '/js/components/tappable.js';

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
    Sonometer,
    Tempo,
    Gauge,
    Metronome,
    BpmManager,
    NavTab,
    PlayBtn
};

// Call the __init__ function of each module.
for (const module of Object.values(modules)) {
    if (typeof module.__init__ === 'function') {
        module.__init__();
    }
}
