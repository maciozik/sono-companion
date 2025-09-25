import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';
import * as Gauge from '/js/widgets/gauge.js';
import * as NavTab from '/js/components/nav-tab.js';

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
        real_time: 0,
        max_local: 0
    },
    average: {
        value: 0,
        nb: 0
    },
    max: 0
}

let timestamp = 0;

let refreshInfosInterval;
let timestampInterval;

/**
 * Run the sonometer.
 */
export function run()
{
    // Run the volume processor.
    getVolume();

    clearInterval(refreshInfosInterval);
    clearInterval(timestampInterval);

    // Refresh the informations of the view regularly.
    refreshAllInfos();
    refreshInfosInterval = setInterval(() => {
        refreshAllInfos();
    }, STG.refresh_infos_interval);

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
    // Stop the stream of the volume processor.
    if (audioContext.state !== 'closed') audioContext.close();
    stream.getTracks().forEach((track) => track.stop());

    // Stop the refresh of the informations, and refresh one last time with real time data.
    clearInterval(refreshInfosInterval);
    refreshAllInfos('real_time');

    // Pause the timestamp.
    clearInterval(timestampInterval);
}

/**
 * Reset the sonometer.
 */
export function reset()
{
    // Reset the volume data.
    volume.current.real_time = 0;
    volume.current.max_local = 0;
    volume.average.value     = 0;
    volume.average.nb        = 0;
    volume.max               = 0;

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
    // Prevent latent updates when the view is paused or stopped.
    if (!View.isRun($view.id) || View.isPause($view.id)) return;

    // Calibrate the volume with user settings.
    db = Math.max(0, (db + STG.audio_calibration));

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
 * Overwrite the volume data in the view.
 * @param {`max_local`|`real_time`} [as_current_volume] The type of current volume to display.
 *  - `max_local`: Choose the local maximum volume as current volume *(default)*.
 *  - `real_time`: Choose the real-time volume as current volume.
 */
function refreshAllInfos(as_current_volume = 'max_local')
{
    let current = volume.current[as_current_volume];

    refreshCurrent(current);
    refreshAverage(volume.average.value);
    refreshMax(volume.max);

    // TODO Threshold, and limit on the last 15 minutes?
    if (volume.average.value > getThreshold()) {
        console.warn("Attention : règlementation plus stricte.");
    } else if (volume.average.value > LIMIT.value) {
        console.error("Danger : seuil maximal autorisé dépassé !")
    }
}

/**
 * Overwrite the current volume in the view.
 * @param {number} current
 */
function refreshCurrent(current)
{
    $current.querySelector('.integral').textContent = Math.trunc(current).addZeros(2);
    $current.querySelector('.decimal').textContent = '.' + Math.float(current, 1);

    const gauge_min = STG.gauge_min;
    const gauge_half = (STG.gauge_min + STG.gauge_max) / 2;

    // Update the icon above the current volume.
    let classname = (current === gauge_min) ? 'low'
                  : (current < gauge_half) ? 'normal'
                  : 'loud';
    setVolumeIcon(classname);

    // Update the label of the tab with current volume.
    NavTab.updateLabel(`${Math.trunc(current)} dB`, 'sonometer');

    // Reset the local maximum.
    volume.current.max_local = 0;
}

/**
 * Overwrite the average volume in the view.
 * @param {number} average
 */
function refreshAverage(average)
{
    $average.querySelector('.integral').textContent = Math.trunc(average).addZeros(2);
    $average.querySelector('.decimal').textContent = '.' + Math.float(average, 1);
}

/**
 * Overwrite the max volume in the view.
 * @param {number} max
 */
function refreshMax(max)
{
    $max.querySelector('.integral').textContent = Math.trunc(max).addZeros(2);
    $max.querySelector('.decimal').textContent = '.' + Math.float(max, 1);
}

/**
 * Refresh the timestamp in the view.
 */
function refreshTimestamp()
{
    let timestamp_s = Math.trunc(timestamp);
    let h = Math.floor(timestamp_s / 3600);
    let m = Math.floor((timestamp_s % 3600) / 60);
    let s = timestamp_s % 60;

    $timestamp.textContent = `${h.addZeros(1)}:${m.addZeros(2)}:${s.addZeros(2)}`;
}

/**
 * Set and show the audio calibration badge.
 * @param {number} value
 */
function setCalibrationBadge(value)
{
    const $calibrationBadge = $view.querySelector('.calibration-badge');

    let value_html = (value < 0) ? value.toString().replace('-', '−') : '+' + value;

    $calibrationBadge.innerHTML = value_html + " dB";
    $calibrationBadge.classList.toggle('show', (value !== 0));
}

/**
 * Set the correct icon above the current volume information.
 * @param {'off'|'low'|'normal'|'loud'} classname
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
        update(Math.max(0, db));
    };
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Click on the reset button.
    // TODO Keep pressing for 0.5s to reset?
    $resetBtn.addEventListener('trigger', function () {
        View.stop();
    });

    // Set the audio calibration badge.
    Settings.onsync('audio_calibration', event => {
        setCalibrationBadge(event.detail.value);
    });

    // Update the refresh interval of the informations while running.
    Settings.onchange('refresh_infos_interval', event => {

        if (!View.isRun($view.id) || View.isPause($view.id)) return;

        clearInterval(refreshInfosInterval);
        refreshInfosInterval = setInterval(() => {
            refreshAllInfos();
        }, event.detail.value);
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
