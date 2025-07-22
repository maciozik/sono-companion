import * as Storage from '../core/storage.js';
import * as View from '../views/view.js';

export const $playBtns = document.querySelectorAll('.play-btn');

// Click on a play button of a view, if it exists.
for (const $playBtn of $playBtns) {

    const $view = $playBtn.closest('.view');

    $playBtn.addEventListener('trigger', () => {

        // Define the mode that should be set.
        let non_run_mode = ($playBtn.querySelector('.pause') !== null) ? 'pause' : 'stop';

        if (!View.isRun() || View.isPause()) {
            View.run($view.id);
        } else if (non_run_mode === 'pause') {
            View.pause($view.id);
        } else {
            View.stop($view.id);
        }

        if (Storage.get('has_been_run') === null) {
            Storage.set('has_been_run', true);
            $playBtns.forEach($playBtn => $playBtn.classList.remove('pulse'));
        }
    });
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({}) {

    // Make play buttons pulse if no view has been run yet (first launch tip).
    if (Storage.get('has_been_run') === null) {
        $playBtns.forEach($playBtn => $playBtn.classList.add('pulse'));
    }
}
