import * as Metronome from '/js/views/metronome.js';
import * as NavTab from '/js/components/nav-tab.js';

const BPM_VISUALIZER_ANIMATION_BPM_LIMIT = 240;
const BPM_VISUALIZER_ENABLED_BPM_LIMIT   = 300;

export const $bpmVisualizer = document.querySelector('#metronome #metronome-bpm-visualizer .bpm-visualizer');
const $bpmVisualizerThumb = $bpmVisualizer.querySelector('.bpm-visualizer-thumb');

/** @type {AudioContext} */
let audioContext;
/** @type {Promise<AudioBuffer>} */
let audioTickBuffer;

let direction;
let bpmVisualizerInterval;

/**
 * Run the bpm visualizer.
 */
export function run()
{
    const bpm = Metronome.get('bpm');
    const duration = Metronome.get('ms');

    // Set the transition duration to match with the bpm.
    $bpmVisualizer.style.setProperty('--bpm-visualizer-transition-duration', `${duration}ms`);

    // Set the mode of the visualizer.
    initMode();
    $bpmVisualizer.classList.remove('disabled');
    Metronome.$replayBtn.classList.remove('disabled');

    // Run the loop.
    animate();

    // Update the label of the tab.
    NavTab.updateLabel(`${bpm} bpm`);
}

/**
 * Stop the bpm visualizer.
 */
export function stop()
{
    clearInterval(bpmVisualizerInterval);

    $bpmVisualizer.classList.add('disabled');
    Metronome.$replayBtn.classList.add('disabled');

    reset();
}

/**
 * Reset the bpm visualizer.
 */
function reset()
{
    clearInterval(bpmVisualizerInterval);
    goto('left', true);
}

/**
 * Replay the bpm visualizer.
 */
export function replay()
{
    reset();
    feedback(false, true);

    // Let the time to reset before looping again.
    requestAnimationFrame(() => {
        const immediate = (isMode('normal'));
        animate(immediate);
    });
}

/**
 * Set the direction of the bpm visualizer thumb.
 * @param {'left'|'right'|'reverse'} to The direction the thumb must go, or `reverse` to invert the current direction.
 * @param {boolean} instant Whether the thumb must go to the direction instantly.
 */
function goto(to, instant = false)
{
    if (to === 'reverse') {
        direction = (direction === 'right') ? 'left' : 'right';
    }
    else {
        direction = to;
    }

    $bpmVisualizer.classList.toggle('instant', instant);

    $bpmVisualizer.classList.remove('left', 'right');
    $bpmVisualizer.classList.add(direction);
}

/**
 * Run the animation in loop following the bpm.
 * @param {boolean} [immediate] Whether to run the animation immediately. – *Default: `true`*
 */
function animate(immediate = true)
{
    const duration = Metronome.get('ms');

    const animation = () => {
        goto('reverse');
        feedback(true, true);
    };

    // First run the animation once if necessary, then run the loop.
    if (immediate) animation();
    bpmVisualizerInterval = setInterval(animation, duration);
}

/**
 * Initialize how the bpm visualizer must behave depending on the bpm.
 */
function initMode()
{
    $bpmVisualizer.classList.remove('jump', 'fix');

    // Change the mode if the bpm exceeds the predefined limits.
    if (!isMode('normal')) {
        const mode = getMode();
        $bpmVisualizer.classList.add(mode);
    }
}

/**
 * Get how the bpm visualizer must behave depending on the bpm.
 * @returns {'normal'|'jump'|'fix'} The current mode.
 */
function getMode()
{
    const bpm = Metronome.get('bpm');

    return (bpm > BPM_VISUALIZER_ENABLED_BPM_LIMIT)   ? 'fix'
         : (bpm > BPM_VISUALIZER_ANIMATION_BPM_LIMIT) ? 'jump'
         : 'normal';
}

/**
 * Check if the bpm visualizer is in a specific mode.
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
    Metronome.$bpmValue.addClassTemporarily('blink', Metronome.BPM_BLINK_DURATION);

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
        fetch(Metronome.METRONOME_AUDIO_TICK_PATH)
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
    Metronome.$view.addEventListener('run', () => {
        createAudioContext();
        run();
    });
    Metronome.$view.addEventListener('stop', stop);
}
