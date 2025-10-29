import * as History from '/js/core/history.js';
import * as Storage from '/js/core/storage.js';
import * as WakeLock from '/js/core/wake-lock.js';
import Modal from '/js/classes/Modal.js';
import Toast from '/js/classes/Toast.js';
import * as Settings from '/js/views/settings.js';
import * as NavTab from '/js/components/nav-tab.js';

export const VIEW_DEFAULT = 'sonometer';

const $h1 = document.querySelector('header h1');
export const $views = document.getElementsByClassName('view');

export const $loadViewBtns = document.querySelectorAll('[data-load]');

/**
 * Load a view.
 * @param {string} view The id of the view, or settings:`setting_name` to make the setting blink.
 * @fires load
 * @fires load:`view_id`
 */
export function load(view)
{
    let [view_id, setting_name] = view.split(':');
    const $view = document.getElementById(view_id);
    let view_title = $view.dataset.name;

    // Update the title.
    $h1.textContent = view_title;

    // Remove .active for all views.
    for (const $view of $views) $view.classList.remove('active');
    // Add .active for the selected view.
    $view.classList.add('active');

    // Store the view as the last loaded view in the storage (except the Settings view).
    if (view_id !== 'settings') {
        Storage.set('last_view_loaded', view_id);
    }

    // Emit 'load' events.
    const event_detail = { view_id: view_id, setting_name: setting_name };
    document.dispatchEvent(new CustomEvent('load', { detail: event_detail }));
    document.dispatchEvent(new CustomEvent(`load:${view_id}`, { detail: event_detail }));
}

/**
 * Set the `run` state on a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires run
 * @fires run:`view_id`
 */
export function run(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    $view.classList.add('run');
    $view.classList.remove('pause');

    WakeLock.handle();
    Storage.setOnce('has_been_run', true);

    // Emit 'run' events.
    document.dispatchEvent(new CustomEvent('run', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`run:${view_id}`));
}

/**
 * Set the `pause` state on a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires pause
 * @fires pause:`view_id`
 */
export function pause(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    $view.classList.add('pause');

    WakeLock.handle();

    // Emit 'pause' events.
    document.dispatchEvent(new CustomEvent('pause', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`pause:${view_id}`));
}

/**
 * Unset the `run` or `pause` state from a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires stop
 * @fires stop:`view_id`
 */
export function stop(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    $view.classList.remove('run', 'pause');

    WakeLock.handle();

    // Emit 'stop' events.
    document.dispatchEvent(new CustomEvent('stop', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`stop:${view_id}`));
}

/**
 * Pause the view if it can be paused, else stop it.
 * @param {string} [view_id] *Default: current view.*
 * @return {'paused'|'stopped'} The new state of the view.
 */
export function suspend(view_id = getCurrent().id) {
    if (canBePaused(view_id)) {
        pause(view_id);
        return 'paused';
    } else {
        stop(view_id);
        return 'stopped';
    }
}

/**
 * Pause or stop all the views that are currently running.
 * @return {number} The number of views that was suspended.
 */
export function suspendAll() {

    let count = 0;

    for (const $view of $views) {

        if (isRun($view.id) && !isPause($view.id)) {
            suspend($view.id);
            count++;
        }
    }

    return count;
}

/**
 * Get the current view element.
 * @returns {HTMLElement}
 */
export function getCurrent()
{
    return document.querySelector('.view.active');
}

/**
 * Get the id of the last loaded view, or the default view if none loaded yet.
 * @returns {string}
 */
export function getLastLoaded()
{
    return STO.last_view_loaded || VIEW_DEFAULT;
}

/**
 * Get the id of the first visible view, or `null` if none visible.
 * @returns {string|null}
 */
export function getFirstVisible()
{
    let first_tab_visible = NavTab.$nav.querySelector('.nav-tab:not(.hide)');
    let view = first_tab_visible?.dataset.load || null;
    return view;
}

/**
 * Get the id of the last loaded view if enabled, else the first visible view (`settings` included).
 * @returns {string}
 */
export function getLastLoadedOrFirstVisible()
{
    let last_view_loaded = getLastLoaded();

    if (isVisible(last_view_loaded)) {
        return last_view_loaded;
    } else {
        return getFirstVisible() || 'settings';
    }
}

/**
 * Is the view enabled and reachable via a visible navigation tab.
 * @param {string} [view_id] *Default: current view.*
 * @returns {boolean}
 */
export function isVisible(view_id = getCurrent().id) {
    let $tab = NavTab.getTabFromViewId(view_id);
    return !$tab.classList.contains('hide');
}

/**
 * Is the `run` state active on a view.
 * @param {string} [view_id] *Default: current view.*
 * @returns {boolean}
 */
export function isRun(view_id = getCurrent().id) {
    return document.getElementById(view_id).classList.contains('run');
}

/**
 * Is the `pause` state active on a view.
 * @param {string} [view_id] *Default: current view.*
 * @returns {boolean}
 */
export function isPause(view_id = getCurrent().id) {
    return document.getElementById(view_id).classList.contains('pause');
}

/**
 * Can the view be paused.
 * @param {string} [view_id] *Default: current view.*
 * @returns {boolean}
 */
export function canBePaused(view_id = getCurrent().id) {
    return document.getElementById(view_id).querySelector('.play-btn .pause') !== null;
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Click on elements that load a view.
    for (const $loadViewBtn of $loadViewBtns) {

        $loadViewBtn.addEventListener('trigger', function () {

            // Hide all existing modals instantly.
            Modal.close(0, true);

            let view_id = this.dataset.load;
            load(view_id);
        });
    }

    // When a view is loaded.
    document.addEventListener('load', event => {

        const view_id = event.detail.view_id;

        // Add .active on the button that loads the selected view.
        for (const $loadViewBtn of $loadViewBtns) {
            let is_active = ($loadViewBtn.dataset.load === view_id);
            $loadViewBtn.classList.toggle('active', is_active);
        }

        // Lock or unlock the screen wake.
        WakeLock.handle();

        // Create a state in the history if the Settings view is loaded.
        if (view_id === 'settings') {
            History.push('settings', () => {
                load(getLastLoadedOrFirstVisible());
            });
        }
        // Remove the state from the history when any other view is loaded.
        else {
            History.cancel('settings');
        }
    });

    // Load the correct view at launch.
    Settings.oninit(null, function () {

        // If the user allowed it, load the last view loaded if visible, or the first visible view.
        if (STG.show_last_tab_opened) {
            load(getLastLoadedOrFirstVisible());
        }
        // Else, load the first visible view.
        else {
            load(getFirstVisible() || 'settings');
        }
    });

    /** @type {number} The number of views suspended when the app loses focus. */
    let suspended_views_count = 0;

    // Pause or stop the view when the app loses focus.
    document.addEventListener('visibilitychange', () => {

        if (document.visibilityState === 'hidden') {
            suspended_views_count = suspendAll();
        }
        else if (document.visibilityState === 'visible' && suspended_views_count > 0) {
            (new Toast("L'application a été mise en pause car elle ne peut pas fonctionner en arrière-plan."))
                .setDuration(4000)
                .setDelay(350)
                .show();
            suspended_views_count = 0;
        }
    });
}
