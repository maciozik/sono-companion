import * as Storage from '../core/storage.js';
import * as Tempo from '../views/tempo.js';

export const $bpmManager = document.querySelector('#tempo #tempo-bpm-manager .bpm-manager');

const SAVES_MAX = 50;

const ADD_BLINK_DURATION = 150;
const TRIGGER_BTNS_DELAY = $bpmManager.getCssProperty('--transition-duration') + 20;

const $addBtn = $bpmManager.querySelector('.bpm-add-btn');
const $nextBtn = $bpmManager.querySelector('.bpm-next-btn');
const $removeBtn = $bpmManager.querySelector('.bpm-remove-btn');

/**
 * Recall the next save in the list.
 */
function next()
{
    const $current = getCurrent();
    const $next = getNext();
    const $afterNext = getAfterNext();

    // Rotate the saves and update the tempo.
    if (getCount() > 1) {
        nextState([$current, $next, $afterNext], () => {
            Tempo.set(parseInt($next.textContent) || null);
        });
    }
}

/**
 * Add the current bpm in the list as the current save.
 */
function add()
{
    let bpm = Tempo.get('bpm');
    const $current = getCurrent();

    // Create a new save.
    const $add = createSave(bpm);
    $add.classList.add('add');

    // Add the save to the DOM after the current one if it exists.
    if (getCount() > 0) {
        $current.after($add);
    } else {
        $add.classList.add('only-child');
        $nextBtn.append($add);
    }

    // Set it as the current save.
    nextState([$current, $add], () => {
        setVisibility();
        handleCountBasedCases('add');
    });
}

/**
 * Remove the current save from the list.
 */
function remove()
{
    const $current = getCurrent();
    const $next = getNext();
    const $afterNext = getAfterNext();

    // Run the remove animation, then remove the save from the DOM.
    setAs('remove', $current);
    $current.addEventListener('transitionend', function() {
        this.remove();
    }, { once: true });

    // Rotate the next saves and update the tempo.
    nextState([$next, $afterNext], () => {
        Tempo.set(parseInt($next?.textContent) || null);
        setVisibility();
        handleCountBasedCases('remove');
    });
}

/**
 * Turn the saves into their logical next state (e.g. `next` into `current`).
 * @param {Array<HTMLElement>} $saves
 * @param {Function} [callback]
 */
function nextState($saves, callback = undefined)
{
    requestAnimationFrame(() => {

        for (const $save of $saves) {

            if ($save === null || stateOf($save) === 'remove') continue;

            switch (stateOf($save)) {

                // Turn current into previous.
                case 'current':
                    $save.addClassTemporarily('previous', 'transitionend');
                    setAs(null, $save);
                    break;

                // Turn next into current.
                case 'next':
                    setAs('current', $save);
                    break;

                // Turn add into current and make it blink.
                case 'add':
                    setAs('current', $save);
                    $save.addEventListener('transitionend', function() {
                        this.addClassTemporarily('blink', ADD_BLINK_DURATION);
                    }, { once: true });
                    break;

                // Turn into next.
                default:
                    setAs('next', $save);
            }
        }

        // Call the callback.
        callback?.call();
    });
}

/**
 * Clone the template of the bpm save.
 * @param {string|number} bpm
 * @returns {HTMLElement}
 */
function createSave(bpm)
{
    /** @type {DocumentFragment} */
    const $bpmSaveTemplate = document.getElementById('bpm-save-template').content;
    /** @type {HTMLElement} */
    const $save = $bpmSaveTemplate.cloneNode(true).querySelector('.bpm-save');

    $save.textContent = bpm;
    return $save;
}

/**
 * Handle the particular behaviors that depend on the number of saves.
 * @param {'add'|'remove'} action The action that called the function.
 */
function handleCountBasedCases(action)
{
    const $current = getCurrent();
    const $next = getNext();

    // If there are 2 saves, set the other one as next after the previous animation.
    if (action === 'add' && getCount() === 2) {
        $next.addEventListener('transitionend', function() {
            doubleRequestAnimationFrame(() => {
                setAs('next', this);
            });
        }, { once: true });
    }

    // If there is one save left, mark it as only child.
    else if (action === 'remove' && getCount() === 1) {
        $current.classList.add('only-child');
    }

    // If there are no saves left, reset the storage.
    else if (action === 'remove' && getCount() <= 0) {
        resetStorage();
    }
}

/**
 * Get the previous save from the DOM.
 * @returns {HTMLElement|null}
 */
function getPrevious()
{
    return $nextBtn.querySelector('.bpm-save.previous') || null;
}

/**
 * Get the current save from the DOM.
 * @returns {HTMLElement|null}
 */
function getCurrent()
{
    return $nextBtn.querySelector('.bpm-save.current')
        || $nextBtn.querySelector('.bpm-save.add')
        || null;
}

/**
 * Get the next save from the DOM.
 * @returns {HTMLElement|null}
 */
function getNext()
{
    return $nextBtn.querySelector('.bpm-save.next')
        || getCurrent()?.nextElementSibling
        || $nextBtn.querySelectorAll('.bpm-save:not(.current)')[0]
        || null;
}

/**
 * Get the after next save from the DOM.
 * @returns {HTMLElement|null}
 */
function getAfterNext()
{
    return getNext()?.nextElementSibling
        || $nextBtn.querySelectorAll('.bpm-save')[0]
        || null;
}

/**
 * Get the state of a save.
 * @param {HTMLElement} $save
 * @returns {'current'|'next'|'add'|'remove'}
 */
function stateOf($save)
{
    let states = ['current', 'next', 'add', 'remove'];

    for (let state of states) {
        if ($save.classList.contains(state)) {
            return state;
        }
    }
}

/**
 * Get the number of saves available in the list.
 * @returns {number}
 */
function getCount()
{
    const $bpmSaves = $nextBtn.querySelectorAll('.bpm-save:not(.remove)');
    return $bpmSaves.length;
}

/**
 * Set the save in a certain state.
 * @param {'current'|'next'|'add'|'remove'|null} state
 * @param {HTMLElement} $save
 */
function setAs(state, $save)
{
    if ($save !== null) {

        $save.classList.remove('current', 'next', 'add', 'remove', 'only-child');

        if (state !== null) {
            $save.classList.add(state);
        }

        if (state === 'current') {
            saveInStorage();
        }
    }
}

/**
 * Set the visibility of the manager (active and/or disabled or not) and the add button (disabled or not).
 */
function setVisibility()
{
    let is_manager_disabled = (getCount() === 0);
    let is_add_btn_disabled = (getCount() >= SAVES_MAX);

    $bpmManager.classList.toggle('disabled', is_manager_disabled);
    $addBtn.classList.toggle('disabled', is_add_btn_disabled);

    requestAnimationFrame(() => {
        let is_manager_active = (Tempo.$bpmValue.textContent === getCurrent()?.textContent);
        $bpmManager.classList.toggle('active', is_manager_active);
    });
}

/**
 * Restore the bpm saves from the storage and add them in the DOM.
 */
function restoreFromStorage()
{
    let bpm_saves = Storage.get('tempo.bpm_saves');
    let current_save_id = Storage.get('tempo.current_save_id') || 0;

    if (bpm_saves === null) return;

    for (let id in Object.keys(bpm_saves)) {
        let bpm = bpm_saves[id];
        const $save = createSave(bpm);

        // Set the save as current.
        if (parseInt(id) === current_save_id) {
            Tempo.set(parseInt(bpm) || null);
            $save.classList.add('current');
        }

        $nextBtn.append($save);
    }

    // Set the next save.
    setAs('next', getNext());

    // Enable the manager and set it as active.
    setVisibility();
}

/**
 * Save the bpm saves and the current save id in the storage.
 */
function saveInStorage()
{
    const $bpmSaves = $nextBtn.querySelectorAll('.bpm-save:not(.remove)');
    let bpm_saves = new Array();

    for (let id in Object.keys($bpmSaves)) {
        const $save = $bpmSaves[id];

        bpm_saves.push(parseInt($save.textContent));

        // Save the id of the current save.
        if (stateOf($save) === 'current') {
            Storage.set('tempo.current_save_id', parseInt(id));
        }
    }

    Storage.set('tempo.bpm_saves', bpm_saves);
}

/**
 * Remove the bpm saves and the current save id from the storage.
 */
function resetStorage()
{
    Storage.remove('tempo.bpm_saves');
    Storage.remove('tempo.current_save_id');
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({ View })
{
    restoreFromStorage();

    // Click on the add button.
    $addBtn.addEventListener('trigger', () => {
        add();
    });

    // Click on the next button.
    $nextBtn.addEventListener('trigger', () => {
        // Recall the next save if the manager is active, or recall the current one.
        if ($bpmManager.classList.contains('active')) {
            next();
        } else {
            Tempo.set(parseInt(getCurrent().textContent) || null);
        }
        View.stop();
    });

    // Click on the remove button.
    $removeBtn.addEventListener('trigger', () => {
        remove();
        View.stop();
    });

    // Deactivate the manager temporarily at each trigger of any button.
    [$addBtn, $nextBtn, $removeBtn].forEach($btn => {
        $btn.addEventListener('trigger', () => {
            $bpmManager.addClassTemporarily('deactivate', TRIGGER_BTNS_DELAY);
        });
    });

    // Observe modifications from the bpm value to set the visibility of the manager.
    const setVisibilityObserver = new MutationObserver(() => setVisibility());
    setVisibilityObserver.observe(Tempo.$bpmValue, { childList: true });
}
