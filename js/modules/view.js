import * as Storage from './storage.js';
import * as Settings from './settings.js';

export const STORAGE_LAST_VIEW_LOADED = () => Storage.get('last_view_loaded') || 'sonometer';

const $h1 = document.querySelector('header h1');
export const $views = document.getElementsByClassName('view');
export const $nav = document.getElementsByTagName('nav')[0];
export const $tabs = $nav.querySelectorAll('.nav-tab');

export const $loadViewBtns = document.querySelectorAll('[data-load]');

let wakeLock = null;

/**
 * Load a view.
 * @param {string} view_id
 * @fires load
 * @fires load:`view_id`
 */
export function load(view_id)
{
    const $view = document.getElementById(view_id);
    let view_title = $view.dataset.name;

    // Update the title.
    $h1.textContent = view_title;

    // Remove .active for all views.
    for (const $view of $views) $view.classList.remove('active');
    // Add .active for the selected view.
    $view.classList.add('active');

    // Add .active for the selected view and remove others.
    for (const $loadViewBtn of $loadViewBtns) {
        let is_active = ($loadViewBtn.dataset.load === view_id);
        $loadViewBtn.classList.toggle('active', is_active);
    }

    // Store the view as the last loaded view in the storage (except the Settings view).
    if (view_id !== 'settings') {
        Storage.set('last_view_loaded', view_id);
    }

    // Request the Wake Lock if the loaded view is running, or release it.
    if (isRun(view_id) && !isPause(view_id)) {
        requestWakeLock();
    } else {
        releaseWakeLock();
    }

    // Emit 'load' events.
    document.dispatchEvent(new CustomEvent('load', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`load:${view_id}`));
}

/**
 * Set the "run" mode on a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires run
 * @fires run:`view_id`
 */
export function run(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    const $tab = getTabFromViewId(view_id);

    $view.classList.remove('pause');

    $view.classList.add('run');
    $tab.classList.add('run');

    requestWakeLock();

    // Emit 'run' events.
    document.dispatchEvent(new CustomEvent('run', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`run:${view_id}`));
}

/**
 * Set the "pause" mode on a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires pause
 * @fires pause:`view_id`
 */
export function pause(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    const $tab = getTabFromViewId(view_id);

    $view.classList.add('pause');
    $tab.classList.remove('run');

    releaseWakeLock();

    // Emit 'pause' events.
    document.dispatchEvent(new CustomEvent('pause', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`pause:${view_id}`));
}

/**
 * Unset the "run" or "pause" mode from a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires stop
 * @fires stop:`view_id`
 */
export function stop(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);
    const $tab = getTabFromViewId(view_id);

    $view.classList.remove('run', 'pause');
    $tab.classList.remove('run');

    releaseWakeLock();

    // Emit 'stop' events.
    document.dispatchEvent(new CustomEvent('stop', { detail: { view_id: view_id } }));
    document.dispatchEvent(new CustomEvent(`stop:${view_id}`));
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
 * Get the id of the first visible view, or null if none visible.
 * @returns {string|null}
 */
export function getFirstVisible()
{
    let first_tab_visible = $nav.querySelector('.nav-tab:not(.hide)');
    let view = first_tab_visible?.dataset.load || null;
    return view;
}

/**
 * Is the "run" mode active on a view.
 * @param {string} [view_id] *Default: current view.*
 */
export function isRun(view_id = getCurrent().id) {
    return document.getElementById(view_id).classList.contains('run');
}

/**
 * Is the "pause" mode active on a view.
 * @param {string} [view_id] *Default: current view.*
 */
export function isPause(view_id = getCurrent().id) {
    return document.getElementById(view_id).classList.contains('pause');
}

/**
 * Get the tab that loads a specific view.
 * @param {string} view_id
 * @returns {HTMLElement}
 */
export function getTabFromViewId(view_id)
{
    return $nav.querySelector(`.nav-tab[data-load=${view_id}]`);
}

/**
 * Set the label of the navigation tab of a view.
 * @param {string} label
 * @param {string} [view_id] *Default: current view.*
 */
export function updateTab(label, view_id = getCurrent().id)
{
    // REFACTOR Automate the update of the tab label (maybe with a data-* attr on the element that must be copy and a onchange() event).
    const $tab = getTabFromViewId(view_id);
    $tab.querySelector('.tab-info').textContent = label;
}

/**
 * Set the visibility of a tab.
 * @param {string} view_id
 * @param {boolean} is_visible
 */
export function setTabVisibility(view_id, is_visible)
{
    const $tab = getTabFromViewId(view_id);

    // Change the visibility of the tab.
    $tab.classList.toggle('hide', !is_visible);

    // Stop the view if the tab must be hide.
    if (is_visible && isRun(view_id)) stop(view_id);

    // Display a message if no tab is visible.
    let is_there_tab_visible = getFirstVisible() !== null;
    $nav.querySelector('p.no-tab').classList.toggle('show', !is_there_tab_visible);
}

/**
 * **(async)** Keep the screen awake.
 */
// TODO Make this work on iPhones (background running video technique?).
async function requestWakeLock()
{
    if (wakeLock === null || wakeLock.released) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.debug("Wake Lock activated.");
        } catch (error) {
            console.warn(error.message);
        }
    }
}

/**
 * **(async)** Allow the screen to fall asleep again.
 */
async function releaseWakeLock()
{
    wakeLock?.release().then(() => {
        wakeLock = null;
        console.debug("Wake Lock deactivated.");
    });
}

/*  EVENT LISTENERS  */

// Bind an event to the play button of every views, if it exists.
for (const $view of $views) {

    const $playBtn = $view.querySelector('.play-btn');

    if ($playBtn !== null) {

        let event = ($playBtn.classList.contains('on-pointer-down')) ? 'pointerdown' : 'pointerup'

        $playBtn.addEventListener(event, () => {

            // Define the mode that should be set.
            let non_run_mode = ($playBtn.querySelector('.pause') !== null) ? 'pause' : 'stop';

            if (!isRun() || isPause()) {
                run($view.id);
            } else if (non_run_mode === 'pause') {
                pause($view.id);
            } else {
                stop($view.id);
            }
        });
    }
}

// Listen the settings to toggle the visibility of the tabs if necessary.
$nav.querySelectorAll('.nav-tab').forEach($tab => {
    let view_id = $tab.dataset.load;
    let event_type = `enable_${view_id}`;

    Settings.onsync(event_type, event => {
        setTabVisibility(view_id, event.detail.value);
    });
});

// Request the Wake Lock if necessary when the app gets the focus.
// TODO Pause or stop the view if the state is not visible (emit an event?).
document.addEventListener('visibilitychange', async () => {
    if (isRun() && !isPause() && document.visibilityState === 'visible') {
        requestWakeLock();
    }
});

/*  SETTINGS  */

Settings.oninit(null, function () {

    // Load the last view loaded if the user setting is true, and if the tab is visible.
    if (Settings.get('show_last_tab_opened') && Settings.get(`enable_${STORAGE_LAST_VIEW_LOADED()}`)) {
        load(STORAGE_LAST_VIEW_LOADED());
    }
    // Else, load the first visible tab, or the settings if no tab is visible.
    else {
        load(getFirstVisible() || 'settings');
    }
});
