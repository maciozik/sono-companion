import * as View from '../views/view.js';

const $playBtns = document.getElementsByClassName('play-btn');

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
    });
}
