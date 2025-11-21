import Scrollbar from '/js/classes/Scrollbar.js';
import * as History from '/js/core/history.js';

export const $fullscreen = document.querySelector('#fullscreen-textarea');
export const $textarea = $fullscreen.querySelector('textarea');

const $closeBtn = $fullscreen.querySelector('.close-btn');

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

/** @type {HTMLTextAreaElement} The textarea linked to the fullscreen textarea. */
let $textareaSource;

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
    $textareaSource.dispatchEvent(new Event('edit-done'));
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

    // Update the scrollbar.
    $target._Scrollbar.update();
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Copy the content to the source textarea.
    $textarea.addEventListener('input', function () {
        replacePunctuationSpaces();
        $textareaSource.value = this.value;
        $textareaSource.dispatchEvent(new Event('input'));
    });

    // Click on the close button.
    $closeBtn.addEventListener('click', () => {
        close();
    });

    // Prevent the "ghost scroll" when the keyboard is open (Chromium only).
    if ('virtualKeyboard' in navigator) {
        navigator.virtualKeyboard.overlaysContent = true;
        $fullscreen.style.height = /*css*/ `calc(100% - env(keyboard-inset-height))`;

        navigator.virtualKeyboard.addEventListener('geometrychange', () => {
            $textarea._Scrollbar.setHeight();
            $textarea._Scrollbar.update();
        });
    }
}
