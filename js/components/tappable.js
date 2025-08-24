import Tappable from '/js/classes/Tappable.js';

/**
 * @see {@link Tappable} for usage and available options of the `data-tappable` attribute.
 */
const $tappables = document.querySelectorAll('[data-tappable]');

for (const $tappable of $tappables) {
    new Tappable($tappable);
}
