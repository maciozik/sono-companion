import Ripple from '/js/classes/Ripple.js';

/**
 * @type {NodeListOf<HTMLElement>}
 * @see {@link Ripple} for usage and available options of the `data-ripple` attributes.
 */
const $rippleables = document.querySelectorAll('[data-ripple]');

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    // Bind the ripple effect to the elements.
    for (const $rippleable of $rippleables) {

        new Ripple($rippleable);

        // Click on a rippleable.
        $rippleable.addEventListener('trigger', function (event) {
            this._Ripple.run(event.detail.event_source);
        })
    }
}
