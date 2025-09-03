'use strict';

import '/js/env.js';
import '/js/core/init.js';

/**  UTILS  **/
import '/js/utils/app.vibrate.js';
import '/js/utils/window/doubleRequestAnimationFrame.js';
import '/js/utils/htmlelement/addClassTemporarily.js';
import '/js/utils/htmlelement/addDynamicEventListener.js';
import '/js/utils/htmlelement/getCssProperty.js';
import '/js/utils/htmlelement/hasBooleanAttribute.js';
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
import * as Sonometer from '/js/views/sonometer.js';
import * as Tempo from '/js/views/tempo.js';
import * as Settings from '/js/views/settings.js';

/**  WIDGETS  **/
import * as Gauge from '/js/widgets/gauge.js';
import * as Metronome from '/js/widgets/metronome.js';
import * as BpmManager from '/js/widgets/bpm-manager.js';

/**  COMPONENTS  **/
import * as NavTab from '/js/components/nav-tab.js';
import * as PlayBtn from '/js/components/play-btn.js';
import '/js/components/scrollbar.js';
import '/js/components/tappable.js';

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

// Call the `__init__` function of each module.
for (const module of Object.values(modules)) {
    if (typeof module.__init__ === 'function') {
        module.__init__();
    }
}
