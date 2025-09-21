import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';
import * as Metronome from '/js/widgets/metronome.js';

export const BPM_DEFAULT = 90;

export const BPM_BLINK_DURATION = 100;

const TAP_TEMPO_RESET_DELAY = 2000;
const TAP_TEMPO_INTERVALS_LIMIT = 20;

export const $view = document.getElementById('tempo');

export const $bpmModifierBtns = $view.querySelectorAll('#tempo-bpm-selector .bpm-modifier-btn');
export const $bpmValue = $view.querySelector('#tempo-bpm-selector .bpm-value');

const $tempoMs = $view.querySelector('#tempo-infos .tempo-ms .info');
const $tempoM = $view.querySelector('#tempo-infos .tempo-m .info');

export const $tapBtn = $view.querySelector('#tempo-controls .tap-tempo-btn');

let tapTempoTimestamps = new Array();
let tapTempoTimeGaps = new Array();
let tapTempoTimeout;

/**
 * Get the bpm.
 * @param {string} [unit] `bpm`, `ms` or `m`. – *Default: `bpm`*
 * @returns {number}
 */
export function get(unit = 'bpm')
{
    let tempo = parseInt($bpmValue.dataset.bpm);
    tempo = convert(tempo, 'bpm', unit);

    return tempo;
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
 * Convert a tempo from a unit to another.
 * @param {number} tempo
 * @param {'bpm'|'ms'|'m'} from_unit The unit of the original tempo.
 * @param {'bpm'|'ms'|'m'} to_unit The unit to convert to.
 * @throws {TypeError}
 * @returns {number|null}
 */
function convert(tempo, from_unit, to_unit)
{
    let bpm = new Number();
    let converted_tempo = new Number();

    // First convert to bpm.
    switch (from_unit) {
        case 'bpm': bpm = tempo; break;
        case 'ms' : bpm = 60000 / tempo; break;
        case 'm'  : bpm = 60 / (tempo / 340); break;
    }
    // Then convert to the target unit.
    switch (to_unit) {
        case 'bpm': converted_tempo = bpm; break;
        case 'ms' : converted_tempo = Math.round(60000 / bpm); break;
        case 'm'  : converted_tempo = Math.round(340 * (60 / bpm)); break;
    }

    return converted_tempo;
}

/**
 * Save the Tap Tempos and calculate the average tempo.
 */
export function tap()
{
    let timestamp = Date.now();

    // Save the timestamp of the new tap.
    let ts_length = tapTempoTimestamps.push(timestamp);

    // Reset the timeout at each tap.
    resetTap(TAP_TEMPO_RESET_DELAY);

    // Change the color.
    $tapBtn.classList.add('active', 'blink');

    // If the user tapped at least two times.
    if (ts_length > 1) {
        let prev_value = tapTempoTimestamps[ts_length-2];
        let curr_value = tapTempoTimestamps[ts_length-1];
        let interval = curr_value - prev_value;

        // Save the time gap between the new tap and the previous.
        let i_length = tapTempoTimeGaps.push(interval);

        // Remove the oldest time gap if there are too many time gaps.
        if (i_length > TAP_TEMPO_INTERVALS_LIMIT) {
            tapTempoTimeGaps.shift();
        }

        // Calculate the average.
        let average = tapTempoTimeGaps.reduce((a, b) => a + b) / i_length;
        set(convert(average, 'ms', 'bpm'));

        // Toggle the visual clues.
        $bpmValue.classList.add('tap-tempo-listen');
        $tapBtn.classList.remove('blink');
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
        tapTempoTimeGaps = [];
        $bpmValue.classList.remove('tap-tempo-listen');
        $tapBtn.classList.remove('active', 'blink');
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
            let modifier = this.dataset.modifier;
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

    // Click on any tappable other than the Tap Tempo button.
    const $tappables = document.querySelectorAll('[data-tappable]:not(.tap-tempo-btn)');
    for (const $tappable of $tappables) {
        $tappable.addEventListener('trigger', function(event) {
            // If the Tap Tempo is active.
            if ($tapBtn.classList.contains('active')) {
                resetTap();
            }
        });
    }

    // Update the bpm if the settings change.
    Settings.onchange(['bpm_min', 'bpm_max'], event => {
        let bpm = get();
        set(bpm);

        View.stop('tempo');
    });
}
