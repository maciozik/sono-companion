import Tappable from '/js/classes/Tappable.js';

/**
 * @see {@link Tappable} for usage and available options of the `data-tappable` attribute.
 */
const $tappables = document.querySelectorAll('[data-tappable]');

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    for (const $tappable of $tappables) {
        new Tappable($tappable);
    }
}
