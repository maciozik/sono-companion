import * as View from '/js/views/view.js';

const $scrollables = document.querySelectorAll('[data-scrollable]');

const MARGIN_BLOCK = 5;
/**
 * Exponential variable for the calculation of the scrollbar thumb height.
 * Higher value reduce the thumb faster as scrollable content height increases.
 */
const SCROLLBAR_THUMB_HEIGHT_INTERPOLATION_FACTOR = .8;

/**
 * Create and position the scrollbar.
 * @param {HTMLElement & { $scrollbar: HTMLElement }} $scrollable The container to position the scrollbar on.
 */
function create($scrollable)
{
    /** @type {DocumentFragment} */
    const $scrollbarTemplate = document.getElementById('scrollbar-template').content;
    /** @type {HTMLElement} */
    const $scrollbar = $scrollbarTemplate.cloneNode(true).querySelector('.scrollbar');

    let scrollbar_position_top = $scrollable.offsetTop + $scrollable.getCssProperty('border-top-width') + MARGIN_BLOCK;
    let scrollbar_position_right = $scrollable.offsetParent.offsetWidth - $scrollable.offsetLeft - $scrollable.offsetWidth + $scrollable.getCssProperty('border-left-width');
    let scrollbar_height = $scrollable.clientHeight - (MARGIN_BLOCK * 2);

    $scrollbar.style.top = `${scrollbar_position_top}px`;
    $scrollbar.style.right = `${scrollbar_position_right}px`;
    $scrollbar.style.height = `${scrollbar_height}px`;

    // Bind the scrollbar DOM element to its scrollable DOM element.
    $scrollable.$scrollbar = $scrollbar;
    $scrollable.after($scrollbar);

    update($scrollable);
}

/**
 * Update the size of the scrollbar thumb and the visibility.
 * @param {HTMLElement & { $scrollbar: HTMLElement }} $scrollable The container linked to the scrollbar.
 */
export function update($scrollable)
{
    const $scrollbar = $scrollable.$scrollbar;
    const $scrollbarThumb = $scrollbar.querySelector('.scrollbar-thumb');

    let document_height = document.documentElement.offsetHeight;
    let scrollable_content_height = $scrollable.scrollHeight;
    let scrollable_height = $scrollable.clientHeight;

    // Show the scrollbar if the content overflows the height.
    setVisibility($scrollable, (scrollable_content_height > scrollable_height));

    let scrollbar_height = $scrollbar.offsetHeight;
    let scrollbar_thumb_height = scrollbar_height * Math.pow(scrollable_height / scrollable_content_height, SCROLLBAR_THUMB_HEIGHT_INTERPOLATION_FACTOR);

    // Set the height of the scrollbar thumb.
    $scrollbarThumb.style.height = `${scrollbar_thumb_height}px`;

    move($scrollable);
}

/**
 * Update the size and visibility of the scrollbar.
 * @param {HTMLElement & { $scrollbar: HTMLElement }} $scrollable The container linked to the scrollbar.
 */
export function move($scrollable)
{
    const $scrollbar = $scrollable.$scrollbar;
    const $scrollbarThumb = $scrollbar.querySelector('.scrollbar-thumb');

    let scrollable_height = $scrollable.clientHeight;
    let scrollable_content_height = $scrollable.scrollHeight;

    let scroll = $scrollable.scrollTop;
    let scrollbar_height = $scrollbar.offsetHeight;
    let scrollbar_thumb_height = $scrollbarThumb.offsetHeight;

    let scrollbar_y = (scrollbar_height - scrollbar_thumb_height) * scroll / (scrollable_content_height - scrollable_height);
    $scrollbarThumb.style.transform = `translateY(${scrollbar_y}px)`;
}

/**
 * Set the visibility of the scrollbar.
 * @param {HTMLElement & { $scrollbar: HTMLElement }} $scrollable The container linked to the scrollbar.
 * @param {boolean} is_visible
 */
export function setVisibility($scrollable, is_visible)
{
    const $scrollbar = $scrollable.$scrollbar;
    $scrollbar.classList.toggle('show', is_visible);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Update the scrollbars if the window is resized.
    // TODO Manage the resize.
    window.addEventListener('resize', () => update(View.getCurrent()));

    // Create the scrollbars and bind the events.
    for (const $scrollable of $scrollables) {
        create($scrollable);
        $scrollable.addEventListener('input',  () => update($scrollable));
        $scrollable.addEventListener('scroll', () => move($scrollable));
    }
}
