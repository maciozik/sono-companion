import * as View from '/js/views/view.js';
import * as Toolbox from '/js/views/toolbox.js';
import * as Settings from '/js/views/settings.js';
import * as Metronome from '/js/widgets/metronome.js';

export const BPM_DEFAULT = 90;
export const BPM_BLINK_DURATION = 100;

const TAP_TEMPO_RESET_DELAY = 2500;
const TAP_TEMPO_INTERVALS_LIMIT = 20;

export const $view = document.getElementById('tempo');

export const $bpmModifierBtns = $view.querySelectorAll('#tempo-bpm-selector .bpm-modifier-btn');
export const $bpmValue = $view.querySelector('#tempo-bpm-selector .bpm-value');

const $tempoMs = $view.querySelector('#tempo-info .tempo-ms .info');
const $tempoM = $view.querySelector('#tempo-info .tempo-m .info');

export const $tapBtn = $view.querySelector('#tempo-controls .tap-tempo-btn');

let tapTempoTimestamps = new Array();
let tapTempoIntervals = new Array();
let tapTempoTimeout;

/**
 * Get the bpm.
 * @param {string} [unit] `bpm`, `ms` or `m`. – *Default: `bpm`*
 * @returns {number}
 */
export function get(unit = 'bpm')
{
    const tempo = parseInt($bpmValue.dataset.bpm);

    let converted_tempo = Toolbox.convert(tempo, 'bpm', unit, false);
    return converted_tempo;
}

/**
 * Set the tempo (in bmp).
 * @param {number|null} bpm If `null`, do nothing.
 * @param {boolean} [clamp] Whether to keep the bpm within the limits. – *Default: `true`*
 */
export function set(bpm, clamp = true)
{
    if (bpm === null) return;

    const bpm_min = STG.bpm_min;
    const bpm_max = STG.bpm_max;

    // If the minimum or maximum limit is reached.
    if (clamp && (bpm < bpm_min || bpm > bpm_max)) {
        bpm = Math.clamp(bpm, bpm_min, bpm_max);
        $bpmValue.addClassTemporarily('limit', 150);
    }

    bpm = Math.round(bpm);

    $bpmValue.dataset.bpm = bpm;
    $bpmValue.textContent = bpm;

    $tempoMs.querySelector('.value').textContent = get('ms');
    $tempoM.querySelector('.value').textContent  = get('m');
}

/**
 * Save the Tap Tempos and calculate the average tempo.
 */
export function tap()
{
    const timestamp = Date.now();

    // Save the timestamp of the new tap.
    const timestamps_length = tapTempoTimestamps.push(timestamp);

    // Reset the timeout at each tap.
    resetTap(TAP_TEMPO_RESET_DELAY);

    // Change the color.
    $tapBtn.classList.add('active', 'warning');

    // If the user tapped at least two times.
    if (timestamps_length > 1) {
        const previous_value = tapTempoTimestamps[timestamps_length-2];
        const current_value = tapTempoTimestamps[timestamps_length-1];
        const interval = current_value - previous_value;

        // Save the time interval between the new tap and the previous.
        const intervals_length = tapTempoIntervals.push(interval);

        // Remove the oldest time gap if there are too many time gaps.
        if (intervals_length > TAP_TEMPO_INTERVALS_LIMIT) {
            tapTempoIntervals.shift();
        }

        // Calculate the average.
        const average = tapTempoIntervals.reduce((a, b) => a + b) / intervals_length;
        set(Toolbox.convert(average, 'ms', 'bpm'));

        // Toggle the visual clues.
        $bpmValue.classList.add('tap-tempo-listen');
        $tapBtn.classList.remove('warning');
    }
}

/**
 * Reset the Tap Tempo.
 * @param {number} [delay] The delay after which the Tap Tempo is reset (in ms). – *Default: `0`*
 */
export function resetTap(delay = 0)
{
    clearTimeout(tapTempoTimeout);

    tapTempoTimeout = setTimeout(() => {
        tapTempoTimestamps = [];
        tapTempoIntervals = [];
        $bpmValue.classList.remove('tap-tempo-listen');
        $tapBtn.classList.remove('active', 'warning');
    }, delay);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Set the default tempo.
    set(BPM_DEFAULT);

    // Click on a bpm modifier button.
    for (const $bpmModifierBtn of $bpmModifierBtns) {

        $bpmModifierBtn.addEventListener('trigger', function () {
            const modifier = this.dataset.modifier;
            let bpm = get('bpm');

            bpm = eval(bpm + modifier);

            set(bpm);
            View.stop();
        });
    }

    // Click on the metronome replay button.
    Metronome.$replayBtn.addEventListener('trigger', function () {
        Metronome.replay();
    });

    // Click on the Tap Tempo button.
    $tapBtn.addEventListener('trigger', () => {
        View.stop();
        tap();
    });

    // Click on any triggerable element other than the Tap Tempo button.
    const $triggerables = document.querySelectorAll('[data-trigger]:not(.tap-tempo-btn)');
    for (const $triggerable of $triggerables) {
        $triggerable.addEventListener('trigger', function(event) {
            // If the Tap Tempo is active.
            if ($tapBtn.classList.contains('active')) {
                resetTap();
            }
        });
    }

    // Update the bpm if the settings change.
    Settings.onchange(['bpm_min', 'bpm_max'], event => {
        const bpm = get();
        set(bpm);

        View.stop('tempo');
    });
}
