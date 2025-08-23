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
 */
export function __init__() {

    // Click on a play button of a view.
    for (const $playBtn of $playBtns) {

        const $view = $playBtn.closest('.view');

        $playBtn.addEventListener('trigger', () => {

            if (!View.isRun() || View.isPause()) {
                checkAudioPermission($view);
            } else {
                View.suspend($view.id);
            }

            pulse(false);
        });
    }

    // Make play buttons pulse if no view has been run yet (first launch tip).
    if (Storage.get('has_been_run') === null) {
        pulse(true);
    }
}
