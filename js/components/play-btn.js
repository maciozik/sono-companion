import * as Storage from '/js/core/storage.js';
import * as AudioPermission from '/js/audio/audio-permission.js';
import * as View from '/js/views/view.js';

const HIGHLIGHT_INTERVAL = 4000;

export const $playBtns = document.querySelectorAll('.play-btn');

let hightlightInterval;

/**
 * Check audio permission if necessary, before running the view.
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
 * Make the play buttons pulse and the icons bounce.
 */
export function highlight()
{
    hightlightInterval = setInterval(() => {
        $playBtns.forEach($playBtn => $playBtn.addClassTemporarily('highlight', (HIGHLIGHT_INTERVAL - 1000)));
    }, HIGHLIGHT_INTERVAL);
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

            // Deactivate the highlight if it exists.
            clearInterval(hightlightInterval);
        });
    }

    // Highlight play buttons if no view has been run yet (first launch tip).
    if (STO.has_been_run === null) {
        highlight();
    }
}
