import TriggerHandler from '/js/classes/TriggerHandler.js';

/**
 * @type {NodeListOf<HTMLElement>}
 * @see {@link TriggerHandler} for usage and available options of the `data-trigger` attributes.
 */
const $triggerables = document.querySelectorAll('[data-trigger]');

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    // Make the elements triggerable.
    for (const $triggerable of $triggerables) {
        new TriggerHandler($triggerable);
    }
}
