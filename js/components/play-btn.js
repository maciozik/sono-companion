import * as Storage from '../core/storage.js';
import * as View from '../views/view.js';
import * as AudioPermission from '../audio/audio-permission.js';

export const $playBtns = document.querySelectorAll('.play-btn');

/**
 * Check audio permission if needed before running the view.
 * @param {HTMLElement} $view
 */
function checkAudioPermission($view)
{
    if ('needsAudioPermission' in $view.dataset) {
        AudioPermission.check(
            () => View.run($view.id),
            () => AudioPermission.openPromptModal(),
            () => AudioPermission.openDenyModal()
        );
    } else {
        View.run($view.id)
    }
}

/**
 * Whether the play buttons must pulse.
 * @param {boolean} isPulse
 */
export function pulse(isPulse)
{
    $playBtns.forEach($playBtn => $playBtn.classList.toggle('pulse', isPulse));
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({ View }) {

    // Click on a play button of a view.
    for (const $playBtn of $playBtns) {

        const $view = $playBtn.closest('.view');

        $playBtn.addEventListener('trigger', () => {

            // Define the mode that should be set ('stop' or 'pause' if a pause button exists).
            let non_run_mode = ($playBtn.querySelector('.pause') !== null) ? 'pause' : 'stop';

            if (!View.isRun() || View.isPause()) {
                checkAudioPermission($view);
            } else if (non_run_mode === 'pause') {
                View.pause($view.id);
            } else {
                View.stop($view.id);
            }

            pulse(false);
        });
    }

    // Make play buttons pulse if no view has been run yet (first launch tip).
    if (Storage.get('has_been_run') === null) {
        pulse(true);
    }
}
