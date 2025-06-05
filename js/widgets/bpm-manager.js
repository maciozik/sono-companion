import * as Storage from '../core/storage.js';
import * as Tempo from '../views/tempo.js';

export const SAVES_MAX = 50;

const $bpmManager = document.querySelector('#tempo #tempo-bpm-manager .bpm-manager');

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

    if (getCount() > 1) {

        // Remove the `previous` class prematurely if the user click too fast.
        getPrevious()?.classList.remove('previous');

        // Rotate the saves and set the new tempo.
        requestAnimationFrame(() => {
            nextState($current, $next, $afterNext);
            Tempo.set($next.textContent);
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

    // Get the template of the bpm save and clone it.
    const $bpmSaveTemplate = document.getElementById('bpm-save-template').content;
    /** @type {HTMLElement} */
    const $add = $bpmSaveTemplate.cloneNode(true).querySelector('.bpm-save');

    // Set the bpm and the classes of the new save.
    $add.textContent = bpm;
    $add.classList.add('add');

    // Add the save to the DOM after the current one if it exists.
    if (getCount() > 0) {
        $current.after($add);
    } else {
        $nextBtn.append($add);
    }

    requestAnimationFrame(() => {
        // Set it as the current save.
        nextState($current, $add);

        // If there is only 2 saves, set the other one as next.
        if (getCount() === 2) {
            $current.addEventListener('transitionend', function() {
                if (this.classList.contains('current')) return;
                doubleRequestAnimationFrame(() => {
                    setAs('next', this);
                });
            }, { once: true });
        }

        // If there is too much saves.
        if (getCount() >= 5) {
            $addBtn.classList.add('disabled');
        }
    });

    // Enable the manager.
    $bpmManager.classList.remove('disabled');
    $bpmManager.classList.add('active');
}

/**
 * Remove the current save from the list.
 */
function remove()
{
    const $current = getCurrent();
    const $next = getNext();
    const $afterNext = getAfterNext();

    // Enable the add button again if needed.
    $addBtn.classList.remove('disabled');

    // Remove the `previous` class prematurely if the user click too fast.
    getPrevious()?.classList.remove('previous');

    // Run the remove animation, then remove the save from the DOM.
    setAs('remove', $current);
    $current.addEventListener('transitionend', function() {
        this.remove();
    }, { once: true });

    requestAnimationFrame(() => {
        // Reorganize the next saves and update the tempo.
        nextState($next, $afterNext);
        Tempo.set($next?.textContent);

        // If there is one save left, mark it as only child.
        if (getCount() === 1) {
            setAs('current', $next);
            $next.classList.add('only-child');
        }
        // Disable the manager if there is no save left.
        else if (getCount() <= 0) {
            $bpmManager.classList.add('disabled');
        }
    });
}

/**
 * Turn the save into its logical next state (e.g. `next` into `current`).
 * @param {...HTMLElement} $saves
 */
function nextState(...$saves)
{
    for (const $save of $saves) {

        if ($save === null || $save.classList.contains('remove')) continue;

        // Turn current into previous.
        if ($save.classList.contains('current')) {
            $save.addClassTemporarily('previous', 'transitionend');
            setAs(null, $save);
        }

        // Turn next into current.
        else if ($save.classList.contains('next')) {
            setAs('current', $save);
        }

        // Turn add into current and make it blink.
        else if ($save.classList.contains('add')) {

            setAs('current', $save);

            $save.addEventListener('transitionend', function() {
                this.addClassTemporarily('blink', 150);
            }, { once: true });
        }

        // Turn into next.
        else {
            setAs('next', $save);
        }
    }
}

/**
 * Get the previou save from the DOM.
 * @returns {HTMLElement}
 */
function getPrevious()
{
    return $nextBtn.querySelector('.bpm-save.previous');
}

/**
 * Get the current save from the DOM.
 * @returns {HTMLElement}
 */
function getCurrent()
{
    return $nextBtn.querySelector('.bpm-save.current');
}

/**
 * Get the next save from the DOM.
 * @returns {HTMLElement}
 */
function getNext()
{
    return $nextBtn.querySelector('.bpm-save.next') || getCurrent()?.nextElementSibling || $nextBtn.querySelectorAll('.bpm-save')[0];
}

/**
 * Get the after next save from the DOM.
 * @returns {HTMLElement}
 */
function getAfterNext()
{
    return getNext()?.nextElementSibling || $nextBtn.querySelectorAll('.bpm-save')[0];
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
    $save.classList.remove('current', 'next', 'add', 'remove', 'only-child');

    if (state !== null) {
        $save.classList.add(state);
    }
}

/**
 * Set the visibility (active or not) of the manager.
 */
function setVisibility()
{
    const $current = getCurrent();
    let is_active = Tempo.$bpmValue.textContent === $current?.textContent;

    $bpmManager.classList.toggle('active', is_active);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({ View })
{
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
            Tempo.set(getCurrent().textContent);
        }
        View.stop();
    });

    // Click on the remove button.
    $removeBtn.addEventListener('trigger', () => {
        remove();
        View.stop();
    });

    // Observe modifications from the bpm value.
    const setVisibilityObserver = new MutationObserver(() => setVisibility());
    setVisibilityObserver.observe(Tempo.$bpmValue, { childList: true });
}
