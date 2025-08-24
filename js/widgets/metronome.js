import * as Settings from '/js/views/settings.js';
import * as Tempo from '/js/views/tempo.js';
import * as NavTab from '/js/components/nav-tab.js';

const METRONOME_ANIMATION_BPM_LIMIT = 240;
const METRONOME_ENABLED_BPM_LIMIT   = 300;

const METRONOME_AUDIO_TICK_PATH = '../../audio/metronome_tick.mp3';

const METRONOME_TICK    = () => Settings.get('metronome_tick');
const METRONOME_VIBRATE = () => Settings.get('metronome_vibrate');

export const $metronome = document.querySelector('#tempo #tempo-metronome .metronome');
const $metronomeCircle = $metronome.querySelector('.metronome-circle');

export const $playBtn = document.querySelector('#tempo #tempo-controls .play-btn');
export const $replayBtn = document.querySelector('#tempo #tempo-controls .metronome-replay-btn');

/** @type {AudioContext} */
let audioContext;
/** @type {Promise<AudioBuffer>} */
let audioTickBuffer;

let direction;
let metronomeInterval;

/**
 * Run the metronome.
 */
export function run()
{
    let bpm = Tempo.get('bpm');
    let bpm_ms = Tempo.get('ms');

    // Set the transition duration to match with the bpm.
    $metronome.style.setProperty('--metronome-transition-duration', `${bpm_ms}ms`);

    // Reset the behavior and enable the replay button.
    $metronome.classList.remove('instant', 'fixed', 'disabled');
    $replayBtn.classList.remove('disabled');

    // Change the behavior if the bpm exceeds high limits.
    if (bpm > METRONOME_ENABLED_BPM_LIMIT) {
        $metronome.classList.add('fixed');
        feedback(true, true);
    }
    else if (bpm > METRONOME_ANIMATION_BPM_LIMIT) {
        $metronome.classList.add('instant');
        feedback(true, true);
    }

    // Run the animation a first time, then run the animation loop.
    goto('right');
    animate(bpm_ms);

    // Update the label of the tab.
    NavTab.updateLabel(`${bpm} bpm`);
}

/**
 * Stop the metronome.
 */
export function stop()
{
    clearInterval(metronomeInterval);

    $metronome.classList.add('disabled');
    $replayBtn.classList.add('disabled');

    reset();
}

/**
 * Reset the metronome.
 */
function reset()
{
    clearInterval(metronomeInterval);
    goto('left', true);
}

/**
 * Replay the metronome.
 */
// FIXME When metronome is running fast without transitions (bpm > 240), the replay button put the circle at the right instead of left.
export function replay()
{
    reset();
    feedback(false, true);

    // Let the time to stop before running again.
    requestAnimationFrame(() => {
        run();
    });
}

/**
 * Set the direction of the metronome circle.
 * @param {'left'|'right'|'reverse'} to The direction the circle must go to, or `reverse` to invert the current direction.
 * @param {boolean} instant Whether the circle must go to the direction instantly.
 */
function goto(to, instant = false)
{
    if (to === 'reverse') {
        direction = (direction === 'right') ? 'left' : 'right';
    }
    else {
        direction = to;
    }

    if (instant) {
        $metronome.classList.add('instant');
    }

    $metronome.classList.remove('left', 'right');
    $metronome.classList.add(direction);
}

/**
 * Run the animation in loop depending on the bpm.
 * @param {number} duration The duration of the animation (in ms).
 */
function animate(duration)
{
    metronomeInterval = setInterval(() => {
        goto('reverse');
        feedback(true, true);
    }, duration);
}

/**
 * Run some feedback.
 * @param {boolean} tick Whether the audio tick must play.
 * @param {boolean} vibrate Whether the device must vibrate.
 */
function feedback(tick, vibrate)
{
    Tempo.$bpmValue.addClassTemporarily('blink', Tempo.BPM_BLINK_DURATION);

    if (tick && METRONOME_TICK()) {
        playAudioTick();
    }
    if (vibrate && METRONOME_VIBRATE()) {
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
 * Create the audio context if it does not exist yet.
 */
function createAudioContext() {

    if (!audioContext) {

        // Create the audio context.
        audioContext = new AudioContext();

        // Set the buffer for audio ticks.
        fetch(METRONOME_AUDIO_TICK_PATH)
            .then(response => response.arrayBuffer())
            .then(arrayBuffer => audioContext.decodeAudioData(arrayBuffer))
            .then(audioBuffer => audioTickBuffer = audioBuffer)
            .catch(() => console.error("Failed to load tick sound."));
    }
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Listen the events emitted by the view.
    document.addEventListener('run:tempo', () => {
        createAudioContext();
        run();
    });
    document.addEventListener('stop:tempo', stop);
}
