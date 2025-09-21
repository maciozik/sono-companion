import * as Settings from '/js/views/settings.js';
import * as Tempo from '/js/views/tempo.js';
import * as NavTab from '/js/components/nav-tab.js';

const METRONOME_ANIMATION_BPM_LIMIT = 240;
const METRONOME_ENABLED_BPM_LIMIT   = 300;

const METRONOME_AUDIO_TICK_PATH = '../../audio/metronome_tick.mp3';

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
    let duration = Tempo.get('ms');

    // Set the transition duration to match with the bpm.
    $metronome.style.setProperty('--metronome-transition-duration', `${duration}ms`);

    // Set the mode of the metronome.
    initMode();
    $metronome.classList.remove('disabled');
    $replayBtn.classList.remove('disabled');

    // Run the loop.
    animate();

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
export function replay()
{
    reset();
    feedback(false, true);

    // Let the time to reset before looping again.
    requestAnimationFrame(() => {
        let immediate = (isMode('normal'));
        animate(immediate);
    });
}

/**
 * Set the direction of the metronome circle.
 * @param {'left'|'right'|'reverse'} to The direction the circle must go, or `reverse` to invert the current direction.
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

    $metronome.classList.toggle('instant', instant);

    $metronome.classList.remove('left', 'right');
    $metronome.classList.add(direction);
}

/**
 * Run the animation in loop following the bpm.
 * @param {boolean} [immediate] Whether to run the animation immediately. – *Default: `true`*
 */
function animate(immediate = true)
{
    let duration = Tempo.get('ms');

    const animation = () => {
        goto('reverse');
        feedback(true, true);
    };

    // First run the animation once if necessary, then run the loop.
    if (immediate) animation();
    metronomeInterval = setInterval(animation, duration);
}

/**
 * Initialize how the metronome must behave depending on the bpm.
 */
function initMode()
{
    $metronome.classList.remove('jump', 'fix');

    // Change the mode if the bpm exceeds the predefined limits.
    if (!isMode('normal')) {
        let mode = getMode();
        $metronome.classList.add(mode);
    }
}

/**
 * Get how the metronome must behave depending on the bpm.
 * @returns {'normal'|'jump'|'fix'} The current mode.
 */
function getMode()
{
    let bpm = Tempo.get('bpm');

    return (bpm > METRONOME_ENABLED_BPM_LIMIT)   ? 'fix'
         : (bpm > METRONOME_ANIMATION_BPM_LIMIT) ? 'jump'
         : 'normal';
}

/**
 * Check if the metronome is in a specific mode.
 * @param {'normal'|'jump'|'fix'} mode
 * @returns {boolean}
 */
export function isMode(mode) {
    return getMode() === mode;
}

/**
 * Run some feedback.
 * @param {boolean} tick Whether the audio tick must play.
 * @param {boolean} vibrate Whether the device must vibrate.
 */
function feedback(tick, vibrate)
{
    Tempo.$bpmValue.addClassTemporarily('blink', Tempo.BPM_BLINK_DURATION);

    if (tick && STG.metronome_tick) {
        playAudioTick();
    }
    if (vibrate && STG.metronome_vibrate) {
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
