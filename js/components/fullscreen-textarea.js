import Scrollbar from '/js/classes/Scrollbar.js';
import * as History from '/js/core/history.js';

export const SAVED_BADGE_DISPLAY_DURATION = 1500;

export const $fullscreen = document.querySelector('#fullscreen-textarea');
export const $textareaHeader = $fullscreen.querySelector('header');
export const $textarea = $fullscreen.querySelector('textarea');

const $savedBadge = $textareaHeader.querySelector('.saved-badge');
const $closeBtn = $textareaHeader.querySelector('.close-btn');

const ATTRIBUTES_TO_COPY = [
    'maxlength',
    'placeholder',
    'inputmode',
    'wrap',
    'autocomplete',
    'autocorrect',
    'autocapitalize',
    'spellcheck',
    'enterkeyhint'
];

/** @type {boolean} */
export let is_open = false;

/** @type {HTMLTextAreaElement} The textarea linked to the fullscreen textarea. */
let $textareaSource;

/** @type {number} The height of the virtual keyboard (Chromium only). */
let keyboard_height = 0;

/** @type {number} */
let savedBadgeTimeout;

/**
 * Open the fullscreen textarea.
 * @param {HTMLTextAreaElement} $from The source textarea that opens the fullscreen textarea.
 * @param {Object<string, any>} styles An object mapping CSS properties in camel case to their values, to apply to the fullscreen textarea.
 */
export function open($from, styles)
{
    $textareaSource = $from;
    init(styles);

    $fullscreen.classList.add('active');
    is_open = true;

    // Create a state in the history.
    History.push('fullscreen-textarea', () => {
        close();
    });
}

/**
 * Close the fullscreen textarea.
 * @fires `edit-done` on $textareaSource.
 */
export function close()
{
    $fullscreen.classList.remove('active');
    $savedBadge.classList.remove('show');
    is_open = false;

    $textarea.blur();

    // Copy the scroll to the source textarea.
    let scroll_top_ratio = $textarea.scrollTop / ($textarea.scrollHeight - $textarea.clientHeight);
    $textareaSource.scrollTop = scroll_top_ratio * ($textareaSource.scrollHeight - $textareaSource.clientHeight);

    // Remove the behavior attributes, the custom styles, and the content.
    ATTRIBUTES_TO_COPY.forEach(attr => $textarea.removeAttribute(attr));
    $textarea.style = $textarea.value = '';

    // Remove the state from the history.
    History.cancel('fullscreen-textarea');

    // Emit the `edit-done` event on the source textarea.
    $textareaSource.dispatchEvent(new CustomEvent('edit-done'));
    $textareaSource = undefined;
}

/**
 * Replace all spaces before "double punctuation" by non-breaking spaces.
 */
function replacePunctuationSpaces()
{
    let { selectionStart, selectionEnd, value } = $textarea;
    let value_replaced = value.replace(/ ([!?:;])/g, "\u00A0$1");

    if (value_replaced !== value) {
        $textarea.value = value_replaced;
        $textarea.setSelectionRange(selectionStart, selectionEnd);
    }
}

/**
 * Update the textarea length and maxlength counter.
 */
function updateCounter()
{
    const $textareaCounter = $textareaHeader.querySelector('.textarea-counter');
    let limit = ($textarea.value.length >= $textarea.maxLength);

    $textareaCounter.querySelector('.length').textContent = $textarea.value.length;
    $textareaCounter.querySelector('.maxlength').textContent = $textarea.maxLength;

    $textareaCounter.classList.toggle('limit', limit);
}

/**
 * Show the saved badge temporarily.
 */
function showSavedBadge()
{
    savedBadgeTimeout?.cancel();
    savedBadgeTimeout = $savedBadge.addClassTemporarily('show', SAVED_BADGE_DISPLAY_DURATION);
}

/**
 * Initialize the fullscreen textarea.
 * @param {Object<string, any>} styles An object mapping CSS properties in camel case to their values, to apply to the fullscreen textarea.
 */
function init(styles)
{
    const $source = $textareaSource;
    const $target = $textarea;

    // Copy the behavior attributes.
    ATTRIBUTES_TO_COPY.forEach(attr => {
        if ($source.hasAttribute(attr)) {
            $target.setAttribute(attr, $source.getAttribute(attr));
        }
    });

    // Set the style.
    Object.entries(styles).forEach(([property, value]) => {
        $target.style[property] = value;
    });

    // Clone the content, the cursor position or selection, and put the focus.
    $target.value = $source.value;
    requestAnimationFrame(() => {
        $target.setSelectionRange($source.selectionStart, $source.selectionEnd, $source.selectionDirection);
        $target.focus();
    });

    updateCounter();
    $target._Scrollbar.update();
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // When the user types.
    $textarea.addEventListener('input', function () {
        replacePunctuationSpaces();
        updateCounter();

        // Copy the content to the source textarea.
        $textareaSource.value = this.value;
        $textareaSource.dispatchEvent(new Event('input'));
    });

    // When the textarea content is saved.
    $textarea.addEventListener('saved', () => {
        if (is_open) {
            showSavedBadge();
        }
    });

    // Click on the close button.
    $closeBtn.addEventListener('trigger', () => {
        close();
    });

    // Prevent the "ghost scroll" when the keyboard is open (Chromium only).
    if ('virtualKeyboard' in navigator) {

        // Prevent the layout to be pushed up when the keyboard opens.
        navigator.virtualKeyboard.overlaysContent = true;

        navigator.virtualKeyboard.addEventListener('geometrychange', () => {

            let current_keyboard_height = navigator.virtualKeyboard.boundingRect.height;
            $fullscreen.style.height = /*css*/ `calc(100% - ${current_keyboard_height}px)`;

            // Update the scroll and scrollbar after the height changed.
            if (is_open && current_keyboard_height > keyboard_height) {
                $textarea.blur();
                $textarea.focus();
                $textarea._Scrollbar.setHeight();
                $textarea._Scrollbar.update();
            }

            keyboard_height = current_keyboard_height;
        });
    }
}
