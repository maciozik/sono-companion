import Toast from '/js/classes/Toast.js';
import * as Toolbox from '/js/views/toolbox.js';
import * as Storage from '/js/core/storage.js';
import * as FullscreenTextarea from '/js/components/fullscreen-textarea.js';

const SAVE_AFTER_LAST_INPUT_DELAY = 1000;

const $notepad = document.querySelector('#toolbox #toolbox-notepad .notepad');

/** @type {number} */
let saveTimeout;

/**
 * Restore the notepad content from the storage.
 */
export function restoreFromStorage(content)
{
    $notepad.value = Storage.get('toolbox.notepad') ?? "";
}

/**
 * Save the notepad content in the storage if it changed.
 * @fires `saved` on FullscreenTextarea.$textarea.
 */
// TODO Persist the data better? (IndexedDB/.txt)
export function saveInStorage()
{
    const current = $notepad.value;
    const stored = Storage.get('toolbox.notepad');

    if (current === stored) return;

    if (current !== "") {
        Storage.set('toolbox.notepad', current);
    } else {
        Storage.remove('toolbox.notepad');
    }

    // Emit the `saved` event on the fullscreen textarea.
    FullscreenTextarea.$textarea.dispatchEvent(new CustomEvent('saved'));
}

/**
 * Reset all the saves from the list.
 */
export function reset()
{
    $notepad.value = "";
    $notepad.dispatchEvent(new Event('input'));

    (new Toast("Bloc-notes effacé.")).show();
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    restoreFromStorage();

    // Open the fullscreen textarea when the notepad is focused.
    $notepad.addEventListener('focus', function () {
        FullscreenTextarea.open($notepad, {
            paddingInline : this.getCssProperty('--fullscreen-textarea-padding-inline', false),
            fontSize      : this.getCssProperty('font-size', false),
            lineHeight    : this.getCssProperty('line-height', false),
            letterSpacing : this.getCssProperty('letter-spacing', false)
        });
    });

    // Save the notepad content in storage after the user stopped typing.
    $notepad.addEventListener('input', function () {
        clearTimeout(saveTimeout);
        saveTimeout = setTimeout(() => {
            this.value = this.value.trimEnd();
            saveInStorage();
        }, SAVE_AFTER_LAST_INPUT_DELAY);
    });

    // When the edition in the fullscreen textarea is done.
    $notepad.addEventListener('edit-done', function () {
        clearTimeout(saveTimeout);
        saveInStorage();

        this.addClassTemporarily('edit-done', 100);
        Toolbox.$savedBadge.addClassTemporarily('show', FullscreenTextarea.SAVED_BADGE_DISPLAY_DURATION);

        setTimeout(() => {
            Toolbox.$savedBadge.querySelector('g-icon').addClassTemporarily('bounce', 'animationend');
        }, 100);
    });
}
