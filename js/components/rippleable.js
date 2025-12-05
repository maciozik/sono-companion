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

    // Click on a rippleable.
    for (const $rippleable of $rippleables) {

        $rippleable.addEventListener('trigger', function (event) {
            const event_source = event.detail.event_source;
            new Ripple($rippleable, event_source.clientX, event_source.clientY);
        });
    }
}
