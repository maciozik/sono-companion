import Scrollbar from '/js/classes/Scrollbar.js';

const $scrollables = document.querySelectorAll('[data-scrollable]');

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    for (const $scrollable of $scrollables) {

        const _Scrollbar = new Scrollbar($scrollable);
        _Scrollbar.create();

        // Bind the events to the scrollable element.
        $scrollable.addEventListener('input',  () => _Scrollbar.update());
        $scrollable.addEventListener('scroll', () => _Scrollbar.moveThumb());
    }
}
