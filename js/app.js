'use strict';

import './env.js';

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
    navigator.serviceWorker.register('js/core/serviceworker.js')
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







// REMOVE Example code for spectrum.

// 31 bandes.
const bandFrequencies = [20, 25, 31, 40, 50, 63, 80, 100, 125, 160, 200, 250, 315,
    400, 500, 630, 800, 1000, 1250, 1600, 2000, 2500, 3150, 4000, 5000, 6300,
    8000, 10000, 12500, 16000, 20000];

// Pondération A complète pour 31 bandes
const aWeighting = [
    -50, -45, -39, -32, -26, -20, -16, -13, -10, -7, -5, -3, -2, -1,
    0, 1, 2, 3, 4, 5, 5, 6, 6, 6, 6, 5, 5, 4, 3, 2, 1
];

async function startAudio() {
    try {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 1024;
        const sampleRate = audioContext.sampleRate;

        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const source = audioContext.createMediaStreamSource(stream);
        source.connect(analyser);

        const bufferLength = analyser.frequencyBinCount;
        const dataArray = new Uint8Array(bufferLength);

        const container = document.getElementById("visualizer");
        container.style.setProperty('--bands', bandFrequencies.length);

        // 📏 Échelle en dB(A)
        const scaleContainer = document.createElement("div");
        scaleContainer.classList.add("scale");
        container.appendChild(scaleContainer);

        // Échelle tous les 20 dB
        for (let dB = -20; dB <= 120; dB += 20) {
            const label = document.createElement("div");
            label.textContent = `${dB}`;
            label.style.position = "absolute";
            label.style.bottom = `${(dB + 20) / 140 * 100}%`;
            scaleContainer.appendChild(label);

            const line = document.createElement("div");
            line.classList.add("grid-line");
            line.style.background = 'rgba(255, 255, 255, 0.7)';
            line.style.bottom = label.style.bottom;
            container.appendChild(line);
        }

        // Échelle fine tous les 10 dB
        for (let dB = -10; dB < 120; dB += 20) {
            const fineLine = document.createElement("div");
            fineLine.classList.add("grid-line", "fine");
            fineLine.style.bottom = `${(dB + 20) / 140 * 100}%`;
            container.appendChild(fineLine);
        }

        // 📊 Création des barres
        const bars = bandFrequencies.map(() => {
            const bar = document.createElement("div");
            bar.classList.add("bar");
            container.appendChild(bar);
            return bar;
        });

        function getIndexForFrequency(freq) {
            const nyquist = sampleRate / 2;
            const index = Math.round((freq / nyquist) * bufferLength);
            return Math.min(index, bufferLength - 1);  // Ajustement pour ne pas dépasser la taille du buffer
        }

        const bandIndices = bandFrequencies.map(getIndexForFrequency);

        function amplitudeToDbSPL(amplitude, weighting) {
            if (amplitude === 0) return -Infinity;
            let dB = 20 * Math.log10(amplitude / 255);
            dB += weighting;
            return dB + 50; // 🔥 Ajustement calibré
        }

        function draw() {
            requestAnimationFrame(draw);
            analyser.getByteFrequencyData(dataArray);

            for (let i = 0; i < bandFrequencies.length; i++) {
                const index = bandIndices[i];
                const amplitude = dataArray[index];
                let dB = amplitudeToDbSPL(amplitude, aWeighting[i]);

                // 🔧 Normalisation : dB de -20 à 120
                let normalizedHeight = ((dB + 20) / 140) * 100;
                normalizedHeight = Math.max(0, Math.min(100, normalizedHeight));

                bars[i].style.height = `${normalizedHeight}%`;
            }
        }

        draw();
    } catch (error) {
        alert("Erreur d'accès au microphone : " + error.message);
    }
}
