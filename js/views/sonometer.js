import * as View from './view.js';
import * as Settings from './settings.js';
import * as Gauge from '../widgets/gauge.js';
import * as NavTab from '../components/nav-tab.js';

const CALIBRATION = () => Settings.get('audio_calibration');
const REFRESH_INFOS_INTERVAL = 200;

// The basic threshold of 80 dB(A) not to be exceeded for 8 hours.
const THRESHOLD = { value: 80, period: 8 * 3600}
// The extrem limit in dB(A) that absolutely must not be exceeded for the last 15 minutes.
const LIMIT = { value: 102, period: 15 * 60 };

export const $view = document.getElementById('sonometer');

const $average = $view.querySelector('#sonometer-infos .db-average');
const $current = $view.querySelector('#sonometer-infos .db-current');
const $max = $view.querySelector('#sonometer-infos .db-max .info');
const $timestamp = $view.querySelector('#sonometer-controls .timestamp');

export const $playBtn = $view.querySelector('#sonometer-controls .play-btn');
export const $resetBtn = $view.querySelector('#sonometer-controls .sonometer-reset-btn');

/** @type {AudioContext} */
let audioContext;
/** @type {Promise<MediaStream>} */
let stream;

/** @type {{ current: { real_time: number, max_local: number }, average: { value: number, nb: number }, max: number }} */
let volume = {
    current: {
        real_time: Gauge.MIN(),
        max_local: Gauge.MIN()
    },
    average: {
        value: 0,
        nb: 0
    },
    max: Gauge.MIN()
}

let timestamp = 0;

let stopped = true;
let refreshInfosInterval;
let timestampInterval;

/**
 * Run the sonometer.
 */
export function run()
{
    stopped = false;

    // Run the volume processor.
    getVolume();

    // Refresh the informations of the view regularly.
    refreshInfo();
    refreshInfosInterval = setInterval(() => {
        refreshInfo();
    }, REFRESH_INFOS_INTERVAL);

    // Run the timestamp.
    timestampInterval = setInterval(() => {
        timestamp += 0.1;
        refreshTimestamp();
    }, 100);

    // Enable the reset button.
    $resetBtn.classList.remove('disabled');
}

/**
 * Pause the sonometer.
 */
export function pause()
{
    // Prevent accidental calls to update().
    stopped = true;

    // Stop the stream of the volume processor.
    if (audioContext.state !== 'closed') audioContext.close();
    stream.getTracks().forEach((track) => track.stop());

    // Stop the refresh of the informations, and refresh one last time.
    clearTimeout(refreshInfosInterval);
    refreshInfo('real_time');

    // Pause the timestamp.
    clearInterval(timestampInterval);
}

/**
 * Reset the sonometer.
 */
export function reset()
{
    // Reset the volume data.
    volume.current.real_time = Gauge.MIN();
    volume.current.max_local = Gauge.MIN();
    volume.average.value = 0;
    volume.average.nb = 0;
    volume.max = Gauge.MIN();

    // Pause the sonometer before reset.
    pause();

    // Reset the timestamp.
    timestamp = 0;
    refreshTimestamp();

    // Reset the gauge, and update the icon above the current volume.
    Gauge.update(volume.current.real_time);
    setVolumeIcon('off');

    // Disable the reset button.
    $resetBtn.classList.add('disabled');

    // Make the device vibrate.
    app.vibrate();
}

/**
 * Update the volume data with current dB SPL volume.
 * @param {number} db
 */
function update(db)
{
    if (!stopped) {

        // Calibrate the volume with user settings.
        db = db + CALIBRATION();

        // Update the gauge.
        Gauge.update(db);

        // Update the volume data.
        if (isFinite(db)) {
            volume.current.real_time = db;
            setMaxLocal(db);
            setAverage(db);
            setMax(db);
        }
    }
}

/**
 * Calculate the local maximum volume between two informations refresh.
 * @param {number} db The current value to compare to the previous maximum.
 */
function setMaxLocal(db)
{
    volume.current.max_local = (db > volume.current.max_local) ? db : volume.current.max_local;
}

/**
 * Calculate the real-time average volume.
 * @param {number} db The current value to add to the sum of the previous values.
 */
function setAverage(db)
{
    // Revert the current average to its sum, and calculate the new average.
    let sum = ((volume.average.nb) * Math.pow(10, volume.average.value / 10)) + Math.pow(10, db / 10);
    volume.average.nb++;
    volume.average.value = 10 * Math.log10(sum / volume.average.nb);
}

/**
 * Calculate the maximum volume.
 * @param {number} db The current value to compare to the previous maximum.
 */
function setMax(db)
{
    volume.max = (db > volume.max) ? db : volume.max;
}

/**
 * Get the threshold that the average volume should not exceed, depending on the current timestamp.
 * @returns {number}
 */
function getThreshold()
{
    // Calculate the tolerance to add to the basic threshold (+3 dB(A) for half the time).
    let tolerance = -1 * (3 * Math.log2(timestamp / THRESHOLD.period));
    return THRESHOLD.value + tolerance;
}

/**
 * Write the volume data in the view.
 * @param {boolean} [as_current_volume] The type of current volume to display. – *Default: `max_local`*
 *                                      - `max_local`: Choose the local maximum volume as current volume.
 *                                      - `real_time`: Choose the real-time volume as current volume.
 */
function refreshInfo(as_current_volume = 'max_local')
{
    let current = (as_current_volume === 'real_time') ? volume.current.real_time : volume.current.max_local;
    let infos = [
        { value: current, $element: $current, main: true },
        { value: volume.average.value, $element: $average },
        { value: volume.max, $element: $max }
    ];

    for (let info of infos) {

        // Clamp between the minimum and the maximum limits.
        info.value = Math.clamp(info.value, Gauge.MIN(), Gauge.MAX());

        // Refresh the info.
        info.$element.querySelector('.integral').textContent = Math.trunc(info.value).addZeros(2);
        info.$element.querySelector('.decimal').textContent  = '.' + Math.float(info.value, 1);

        // For the current volume information only.
        if (info.main === true) {

            // Update the icon above the current volume.
            if (info.value === Gauge.MIN()) setVolumeIcon('low');
            else if (info.value < ((Gauge.MAX() + Gauge.MIN()) / 2)) setVolumeIcon('normal');
            else setVolumeIcon('loud');

            // Update the label of the tab with current volume.
            NavTab.updateTab(`${Math.trunc(info.value)} dB`, 'sonometer');
        }
    }

    // Reset the local maximum.
    volume.current.max_local = Gauge.MIN();

    // TODO Threshold, and limit on the last 15 minutes.
    if (volume.average.value > getThreshold()) {
        console.warn('Attention : règlementation plus stricte.');
    } else if (volume.average.value > LIMIT.value) {
        console.error('Danger : seuil maximal autorisé dépassé !')
    }
}

/**
 * Refresh the timestamp in the view.
 */
function refreshTimestamp()
{
    let timestampS = Math.trunc(timestamp);
    let h = Math.floor(timestampS / 3600);
    let m = Math.floor((timestampS % 3600) / 60);
    let s = timestampS % 60;

    $timestamp.textContent = `${h.addZeros(1)}:${m.addZeros(2)}:${s.addZeros(2)}`;
}

/**
 * Set and show the audio calibration information.
 * @param {number} value
 */
function setCalibrationInfo(value)
{
    const $calibration = $view.querySelector('.calibration');
    const $calibrationValue = $calibration.querySelector('.calibration-value');

    let value_html = value.addZeros(1, 'trailing');
    value_html = (value < 0) ? value_html.replace('-', '−') : '+' + value_html;

    $calibrationValue.innerHTML = value_html + " dB";
    $calibration.classList.toggle('show', value !== 0);
}

/**
 * Set the right icon above the current volume information.
 * @param {string} classname
 */
function setVolumeIcon(classname)
{
    $current.querySelectorAll('g-icon').forEach(icon => icon.classList.remove('active'));
    $current.querySelector('g-icon.' + classname).classList.add('active');
}

/**
 * **(async)** Get the volume of the ambient sound, and call update().
 */
async function getVolume()
{
    // Create the audio context.
    audioContext = new AudioContext();
    await audioContext.resume();

    // Get the audio stream from the microphone.
    // REFACTOR Put this in a global function? And manage the audio permission.
    stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const MicSourceNode = audioContext.createMediaStreamSource(stream);

    // Load the Volume Audio Worklet.
    await audioContext.audioWorklet.addModule('js/audio/worklets/VolumeProcessor.js');

    // Create the node from the Audio Worklet and connect the microphone to it.
    const VolumeNode = new AudioWorkletNode(audioContext, 'VolumeProcessor');
    MicSourceNode.connect(VolumeNode);

    // Get the volume after processed by the Volume Audio Worklet.
    VolumeNode.port.onmessage = (event) => {
        let db = Math.roundFloat(event.data, 1);
        update(db);
    };
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({ View, Settings })
{
    // Click on the reset button.
    // TODO Keep pressing for 0.5s to reset?
    $resetBtn.addEventListener('trigger', function () {
        View.stop();
    });

    // Show the audio calibration information.
    Settings.onsync('audio_calibration', event => {
        setCalibrationInfo(event.detail.value);
    });

    // Show or hide the timestamp.
    Settings.onsync('show_timestamp', event => {
        $playBtn.classList.toggle('no-timestamp', !event.detail.value);
    });

    // Listen the events emitted by the view.
    document.addEventListener('run:sonometer', run);
    document.addEventListener('pause:sonometer', pause);
    document.addEventListener('stop:sonometer', reset);
}
