import * as History from '/js/core/history.js';

export const $fullscreen = document.querySelector('#fullscreen-textarea');
export const $textarea = $fullscreen.querySelector('textarea');

const $closeBtn = $fullscreen.querySelector('.close-btn');

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

    // Remove the behavior attributes.
    [...$textarea.attributes].forEach(attribute => $textarea.removeAttribute(attribute.name));

    // Remove the state from the history.
    History.cancel('fullscreen-textarea');

    // Emit the `edit-done` event on the source textarea.
    $textareaSource.dispatchEvent(new Event('edit-done'));
}

/**
 * Initialize the fullscreen textarea.
 * @param {Object<string, any>} styles
 */
function init(styles)
{
    const $source = $textareaSource;
    const $target = $textarea;

    // Clone the behavior attributes.
    let ignore = ['id', 'class', 'style', 'readonly'];
    for (let attribute of $source.attributes) {
        if (!ignore.includes(attribute.name)) {
            $target.setAttribute(attribute.name, attribute.value);
        }
    }

    // Set the style.
    Object.entries(styles).forEach(([property, value]) => {
        $target.style[property] = value;
    });

    // Clone the content, the cursor position or selection, and put the focus.
    $target.value = $source.value;
    requestAnimationFrame(() => {
        $target.selectionStart     = $source.selectionStart;
        $target.selectionEnd       = $source.selectionEnd;
        $target.selectionDirection = $source.selectionDirection;
        $target.focus();
    });

    return this;
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Clone the content to the source textarea.
    $textarea.addEventListener('input', function () {
        $textareaSource.value = this.value;
        $textareaSource.dispatchEvent(new Event('input'));
    });

    // Click on the close button.
    $closeBtn.addEventListener('click', () => {
        close();
    });
}
