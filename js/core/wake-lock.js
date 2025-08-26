import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';

let wakeLock = null;

/**
 * Handle the request or the release of the Wake Lock.
 */
export function handle()
{
    requestAnimationFrame(() => {

        if (Settings.get('always_keep_screen_awake') === true) {
            lock();
            return;
        }

        if (View.isRun() && !View.isPause() && Settings.get('keep_screen_awake_on_run') === true) {
            lock();
        } else {
            unlock();
        }
    });
}

/**
 * **(async)** Keep the screen awake.
 */
// TODO Make this work on iPhones (background running video technique?).
export async function lock()
{
    if (wakeLock === null || wakeLock.released) {
        try {
            wakeLock = await navigator.wakeLock.request('screen');
            console.debugType('wakelock', 'activated');
        } catch (error) {
            console.warn(error.message);
        }
    }
}

/**
 * **(async)** Allow the screen to fall asleep again.
 */
export async function unlock()
{
    wakeLock?.release().then(() => {
        wakeLock = null;
        console.debugType('wakelock', 'deactivated');
    });
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Lock the screen wake if necessary when the app gets focus.
    document.addEventListener('visibilitychange', async () => {
        if (document.visibilityState === 'visible') {
            handle();
        }
    });

    // Lock or unlock the screen wake if the setting changes.
    Settings.onchange('always_keep_screen_awake', event => {
        handle();
    });
}
