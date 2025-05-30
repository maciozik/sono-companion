import * as View from '../views/view.js';
import * as Tempo from '../views/tempo.js';
import * as Settings from '../views/settings.js';
import * as NavTab from '../components/nav-tab.js';

const METRONOME_ANIMATION_BPM_LIMIT = 240;
const METRONOME_ENABLED_BPM_LIMIT   = 300;

const METRONOME_AUDIO_TICK_PATH = '../../audio/metronome_tick.mp3';

const METRONOME_TICK    = () => Settings.get('metronome_tick');
const METRONOME_VIBRATE = () => Settings.get('metronome_vibrate');

export const $metronome = document.querySelector('#tempo #tempo-metronome .metronome');
const $metronomeCircle = $metronome.querySelector('.metronome-circle');

export const $playBtn = document.querySelector('#tempo #tempo-controls .play-btn');
export const $replayBtn = document.querySelector('#tempo #tempo-controls .metronome-replay-btn');

let audioContext = new AudioContext();
/** @type {Promise<AudioBuffer>} */
let audioTickBuffer;

let metronomeInterval;

/**
 * Run the metronome.
 */
export function run()
{
    let bpm = Tempo.get('bpm');
    let bpm_ms = Tempo.get('ms');
    let direction = 'right';
    let feedback_at_run = false;

    // Set the transition duration to match with the bpm.
    $metronomeCircle.style.transitionDuration = bpm_ms + 'ms';

    // Change the behavior if the bpm exceeds high limits.
    $metronome.classList.remove('instant', 'fixed', 'disabled');
    if (bpm > METRONOME_ENABLED_BPM_LIMIT) {
        $metronome.classList.add('fixed');
        feedback_at_run = true;
    }
    else if (bpm > METRONOME_ANIMATION_BPM_LIMIT) {
        $metronome.classList.add('instant');
        feedback_at_run = true;
    }

    // Run the animation immediately, then run it in loop depending on the bpm.
    animate(direction, feedback_at_run);
    metronomeInterval = setInterval(() => {
        // Toggle the direction before running the animation.
        direction = (direction === 'right') ? 'left' : 'right';
        animate(direction, true);
    }, bpm_ms);

    // Enable the replay button.
    $replayBtn.classList.remove('disabled');

    // Reset the Tap Tempo.
    Tempo.resetTap();

    // Update the label of the tab.
    NavTab.updateTab(`${bpm} bpm`);
}

/**
 * Stop the metronome.
 */
export function stop()
{
    $metronome.classList.add('instant', 'disabled');

    // Reset the animation and the interval that runs it.
    animate('left', false);
    clearInterval(metronomeInterval);

    // Disable the replay button.
    $replayBtn.classList.add('disabled');

    // Reset the Tap Tempo.
    Tempo.resetTap();
}

/**
 * Replay the metronome.
 */
export function replay()
{
    $metronome.classList.add('instant');

    // Reset the animation and the interval that runs it.
    animate('left', true);
    clearInterval(metronomeInterval);

    setTimeout(() => {
        run();
    }, 1); // Let the time to stop before running again.
}

/**
 * Set the direction of the metronome circle.
 * @param {string} direction `left` or `right`.
 * @param {boolean} [has_feedback] Whether or not the bpm must blink and the device must vibrate. – *Default: `true`*
 */
function animate(direction, has_feedback = true)
{
    // Set the direction.
    $metronome.classList.remove('left', 'right');
    $metronome.classList.add(direction);

    // Run some feedbacks.
    if (has_feedback) {
        feedback();
    }
}

/**
 * Make the bpm value blink, and can run a sound and/or a vibration depending on the user settings.
 */
function feedback()
{
    Tempo.$bpmValue.addClassTemporarily('blink', Tempo.BPM_BLINK_DURATION);

    if (METRONOME_TICK()) {
        playAudioTick();
    }
    if (METRONOME_VIBRATE()) {
        app.vibrate(20);
    }
}

/**
 * Play an audio tick.
 */
function playAudioTick()
{
    if (audioTickBuffer) {
        const source = audioContext.createBufferSource();

        source.buffer = audioTickBuffer;
        source.connect(audioContext.destination);
        source.start(audioContext.currentTime);
    }
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({})
{
    // Set the buffer for audio ticks.
    fetch(METRONOME_AUDIO_TICK_PATH)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
        .then(audioBuffer => audioTickBuffer = audioBuffer)
        .catch(() => console.error("Failed to load tick sound."));

    // Listen the events emitted by the view.
    document.addEventListener('run:tempo', run);
    document.addEventListener('stop:tempo', stop);
}
