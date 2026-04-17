import Ripple from '/js/classes/Ripple.js';

/**
 * @type {NodeListOf<HTMLElement>}
 * @see {@link Ripple} for usage and available options of the `data-ripple` attributes.
 */
const $rippleables = document.querySelectorAll('[data-ripple]');

/**
 * Remove the persistent ripple from a rippleable element.
 * @param {HTMLElement} $rippleable
 */
export function removePersistRipple($rippleable)
{
    $rippleable.querySelector('.ripple.persist')?.classList.add('remove');
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    for (const $rippleable of $rippleables) {

        // Click on a rippleable element.
        $rippleable.addEventListener('trigger', function (event) {
            const event_source = event.detail.event_source;
            new Ripple(this, event_source.clientX, event_source.clientY);
        });

        // Bind the function to the rippleable element to remove the persistent ripple.
        $rippleable.removePersistRipple = removePersistRipple.bind(null, $rippleable);
    }
}
