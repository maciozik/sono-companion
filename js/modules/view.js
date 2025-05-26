import Modal from '../classes/Modal.js';
import * as Settings from './settings.js';
import * as Storage from './storage.js';
import * as NavTab from './utils/nav-tab.js';
import * as AudioPermission from './utils/audio_permission.js';

export const STORAGE_LAST_VIEW_LOADED = () => Storage.get('last_view_loaded') || 'sonometer';

const $h1 = document.querySelector('header h1');
export const $views = document.getElementsByClassName('view');

export const $loadViewBtns = document.querySelectorAll('[data-load]');

let wakeLock = null;

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
 * Set the "run" mode on a view.
 * @param {string} [view_id] *Default: current view.*
 * @fires run
 * @fires run:`view_id`
 */
export function run(view_id = getCurrent().id)
{
    const $view = document.getElementById(view_id);

    $view.classList.add('run');
    $view.classList.remove('pause');

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

    $view.classList.add('pause');

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

    $view.classList.remove('run', 'pause');

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
    let first_tab_visible = NavTab.$nav.querySelector('.nav-tab:not(.hide)');
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

/**
 * Init the module and its components.
 * Called only once during application startup.
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({ Settings })
{
    // Click on elements that load a view.
    for (const $loadViewBtn of $loadViewBtns) {

        $loadViewBtn.addEventListener('trigger', function () {

            let view_id = this.dataset.load;

            // Hide all existing modals instantly.
            Modal.close(0, true);

            // Load the view.
            load(view_id);

            // If the view loaded needs the audio permission.
            // REFACTOR Move to a new file.
            if ('needsAudioPermission' in this.dataset) {

                // Check if the audio permission is granted, and show the modal if not.
                // TODO Open the modal at the load of the app if necessary.
                AudioPermission.isGranted(
                    () => {
                        // startAudio();
                    },
                    () => {
                        (new Modal("Accès au microphone"))
                            .setText(ENV.APP.NAME + " a besoin de l'accès à votre microphone pour analyser le son ambiant.")
                            .setPrimaryBtn(`Donner l'accès <g-icon data-name="mic" class="right"></g-icon>`, () => {
                                AudioPermission.grant(
                                    () => {
                                        Modal.close();
                                        // startAudio();
                                    },
                                    null,
                                    () => {
                                        // TODO Display another modal to explain how reset permission.
                                    }
                                );
                            })
                            .setSecondaryBtn(null)
                            .setContext('view')
                            .disallowClickOutside()
                            .open();
                    }
                );
            }
        });
    }

    // Request the Wake Lock if necessary when the app gets the focus.
    // TODO Pause or stop the view if the state is not visible (emit an event?).
    document.addEventListener('visibilitychange', async () => {
        if (isRun() && !isPause() && document.visibilityState === 'visible') {
            requestWakeLock();
        }
    });

    // When a view is loaded.
    document.addEventListener('load', event => {

        const view_id = event.detail.view_id;

        // Add .active on the button that loads the selected view.
        for (const $loadViewBtn of $loadViewBtns) {
            let is_active = ($loadViewBtn.dataset.load === view_id);
            $loadViewBtn.classList.toggle('active', is_active);
        }

        // Request the Wake Lock if the loaded view is running, or release it.
        if (isRun(view_id) && !isPause(view_id)) {
            requestWakeLock();
        } else {
            releaseWakeLock();
        }
    });

    // Load the correct view at launch.
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
}
