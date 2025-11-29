/**
 * @typedef {Object} State
 * @property {string} name The name of the state.
 * @property {Function} callback The callback to call when the back button or gesture is triggered.
 */

/** @type {Array<State>} */
const states = new Array();

let skipNextPopstate = false;

/**
 * Push a state in the history.
 * @param {string} name An arbitrary name for the state.
 * @param {Function} callback The callback to call when the back button or gesture is triggered.
 */
export function push(name, callback)
{
    // Avoid to push the same state more than once.
    if (isState(name)) return;

    states.push({ name, callback });

    const url = '?' + name;
    history.pushState({ name }, '', url);

    console.debugType('history:push', name);
}

/**
 * Call the callback when the back button or gesture is triggered.
 */
function leave()
{
    // Remove the current state before calling the callback.
    const current_state = states.pop();
    current_state?.callback?.call();
}

/**
 * Remove a state from the history if it is the current one, without calling any callback.
 * @param {string} name
 */
// BUG The sequence "grant audio permission modal" > open settings > cancel by clicking a tab, close the app.
//     Cause: history.back() is kind of asynchronous, so it cancels the 'settings' state even if it is called before.
export function cancel(name)
{
    if (!isState(name)) return;

    // Remove the current state.
    const current_state = states.pop();

    console.debugType('history:cancel', current_state?.name);

    // Go back in the history manually without triggering the popstate event.
    skipNextPopstate = true;
    history.back();
}

/**
 * Get the current state
 * @returns {State|undefined}
 */
function getCurrentState()
{
    return states.at(-1);
}

/**
 * Check if the current state matches the given one.
 * @param {string} name
 * @returns {boolean}
 */
export function isState(name)
{
    return getCurrentState()?.name === name;
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // When the back button or gesture of the device is triggered.
    window.addEventListener('popstate', event => {

        // Ignore if the popstate event got triggered by the `cancel` function.
        if (skipNextPopstate) {
            skipNextPopstate = false;
            return;
        }

        console.debugType('history:popstate', getCurrentState()?.name);

        leave();
    });
}
