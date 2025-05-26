import * as View from './view.js';
import * as Tempo from './tempo.js';
import * as Settings from './settings.js';
import * as NavTab from './utils/nav-tab.js';

const METRONOME_ANIMATION_BPM_LIMIT = 240;
const METRONOME_ENABLED_BPM_LIMIT   = 300;

const METRONOME_CLICK = () => Settings.get('metronome_click');
const METRONOME_VIBRATE = () => Settings.get('metronome_vibrate');

export const $metronome = document.querySelector('#tempo #tempo-metronome .metronome');
const $metronomeCircle = $metronome.querySelector('.metronome-circle');

export const $playBtn = document.querySelector('#tempo #tempo-controls .play-btn');
export const $replayBtn = document.querySelector('#tempo #tempo-controls .metronome-replay-btn');

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
        animate(direction);
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
    animate('left', false);
    clearInterval(metronomeInterval);

    setTimeout(() => {
        run();
    }, 1); // Let the time to stop before running again.

    app.vibrate(20);
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

    // TODO Audio ticks.

    // Blink the bpm value, and make the device vibrate.
    if (has_feedback) {
        feedback();
    }
}

function feedback()
{
    Tempo.$bpmValue.addClassTemporarily('blink', Tempo.BPM_BLINK_DURATION);

    if (METRONOME_VIBRATE()) {
        app.vibrate(20);
    }
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({})
{
    // Listen the events emitted by the view.
    document.addEventListener('run:tempo', run);
    document.addEventListener('stop:tempo', stop);
}
