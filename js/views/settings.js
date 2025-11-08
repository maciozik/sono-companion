import Setting from '/js/classes/Setting.js';
import Modal from '/js/classes/Modal.js';
import Toast from '/js/classes/Toast.js';
import Scrollbar from '/js/classes/Scrollbar.js';
import SettingList from '/js/custom-elements/SettingList.js';
import SettingAction from '/js/custom-elements/SettingAction.js';
import * as Storage from '/js/core/storage.js';

export const $view = document.getElementById('settings');

/** @type {Array<Setting>} */
export const $settings = $view.getElementsByClassName('setting');

// Global object for fast access to settings.
window.STG = new Proxy({}, {
    get(_, property) {
        let value = get(property);
        if (value === null) console.error(`STG Proxy: The setting '${property}' does not exist or is not a valid JSON.`);
        return value;
    },
    set() {
        throw new Error(`STG Proxy: Settings cannot be modified that way.`);
    }
});

/**
 * Get a setting from the storage.
 * @param {string} setting_name The name of the setting (in snake case).
 * @returns {string|number|boolean|null} `null` if the setting does not exist in the storage or is not a valid JSON.
 */
export function get(setting_name)
{
    const keys = Storage.getKeys();

    for (let key of keys) {
        if (key.startsWith('setting') && key.endsWith(setting_name)) {
            return Storage.get(key);
        }
    }

    return null;
}

/**
 * Set a setting in the storage.
 * @param {string} setting_name The name of the setting (in snake case).
 * @param {string|number|boolean} value The value to set.
 * @param {string} context The context of the setting (i.e. the id of the view, or a keyword).
 * @returns {string|number|boolean} The value after conversion.
 */
function set(setting_name, value, context)
{
    // Convert the value to the correct type if necessary (boolean or number).
    if (value === 'true') {
        value = true;
    }
    else if (value === 'false') {
        value = false;
    }
    else if (/^\d+$/.test(value)) {
        value = parseInt(value);
    }

    // Store the setting in the storage.
    Storage.set(`setting.${context}.${setting_name}`, value);

    return value;
}

/**
 * Change a setting in the storage if different.
 * @param {string} setting_name The name of the setting (in snake case).
 * @param {string|number|boolean} value The value to set.
 * @param {string} context The context of the setting (i.e. the id of the view, or a keyword).
 * @fires setting:onchange:`setting_name`
 * @fires setting:onsync:`setting_name`
 * @returns {string|number|boolean|undefined} The value after conversion.
 */
export function change(setting_name, value, context)
{
    if (value === get(setting_name)) return;

    let value_converted = set(setting_name, value, context);

    // Emit the 'onchange' and 'onsync' events.
    emitEvent(setting_name, value_converted, 'onchange');
    emitEvent(setting_name, value_converted, 'onsync');

    return value_converted;
}

/**
 * Remove a setting from the storage.
 * @param {string} setting_name
 * @param {string} context
 */
function remove(setting_name, context)
{
    Storage.remove(`setting.${context}.${setting_name}`);
}

/**
 * Get the value of a setting from the view.
 * @param {string} setting_name The name of the setting (in snake case).
 * @returns {string}
 */
function getFromView(setting_name)
{
    let $setting = getSettingFromName(setting_name);
    return $setting.value;
}

/**
 * Set the value of a setting in the view.
 * @param {string} setting_name The name of the setting (in snake case).
 * @param {string|number|boolean|null} value The value to set, or `null` to remove the setting from the storage.
 * @returns {string|number|boolean} The new value (can be different if the value is not valid and changes).
 */
function setInView(setting_name, value)
{
    let $setting = getSettingFromName(setting_name);

    // Set the setting.
    return $setting.set(value);
}

/**
 * Check all the settings to change the visibility of groups, if necessary.
 */
export function checkVisibility()
{
    // For each existing settings.
    settings_loop: for (const $setting of $settings) {

        // For each parent setting that can disable this setting.
        for (const parent_setting of $setting.parent_settings) {

            let $parentSetting = parent_setting[0];
            let on = parent_setting[1];

            // If that parent setting that disable on true is true / that disable on false is false,
            // disable this child setting, then continue to the next setting.
            if ($parentSetting.value === on) {
                $setting.setVisibility(false);
                continue settings_loop;
            }
        }

        // Else, enable this setting.
        $setting.setVisibility(true);
    }
}

/**
 * Scroll to the setting and make it blink.
 * @param {string} setting_name
 * @param {number} [delay_before_blink] The delay before making the setting blink.
 */
export function highlight(setting_name, delay_before_blink = 0)
{
    if (setting_name === undefined) return;

    const $setting = getSettingFromName(setting_name);

    let {offsetTop, offsetHeight} = $setting;
    let view_height = $view.clientHeight;
    let scroll = offsetTop - (view_height / 2) + (offsetHeight / 2);

    $view.scrollTop = scroll;

    setTimeout(() => {
        $setting.addClassTemporarily('blink', 'animationend');
    }, delay_before_blink);
}

/**
 * Get the setting element with the name given.
 * @param {string} setting_name
 * @returns {HTMLElement & Setting}
 */
function getSettingFromName(setting_name)
{
    return $view.querySelector(`[data-name="${setting_name}"]`);
}

/**
 * Initialize the settings in the app with storage data, or create them in storage if they don't exist yet.
 * @fires settings:oninit
 * @fires setting:oninit:`setting_name`
 * @fires setting:onsync:`setting_name`
 */
function init()
{
    /** @type {Array<{ name: string, value: string|number|boolean }>} */
    let settings = new Array();

    for (const $setting of $settings) {

        if ($setting instanceof SettingAction) continue;

        // Get the value from the storage.
        let value = get($setting.name);

        // If the setting is already in the storage, set it in the view and get the value back (can be different).
        if (value !== null) {
            value = setInView($setting.name, value);
        }
        // If the setting is not in the storage yet or is not a valid JSON, get the default value.
        else {
            value = getFromView($setting.name);
            console.debugType('create_key', `setting.${$setting.context}.${$setting.name}`, value);
        }

        // Create or update the setting in the storage.
        set($setting.name, value, $setting.context);
        settings.push({ name: $setting.name, value: value });
    }

    // When everything is loaded.
    window.addEventListener('load', () => {

        // Emit the `oninit` and `onsync` events on all settings.
        for (let setting of settings) {
            emitEvent(setting.name, setting.value, 'oninit');
            emitEvent(setting.name, setting.value, 'onsync');
        }

        // Emit the global `settings:oninit` event.
        document.dispatchEvent(new CustomEvent('settings:oninit'));

        // Check if the visibility of some settings must change.
        checkVisibility();
    });
}

/**
 * Reset all the settings to their default value.
 */
export function reset()
{
    for (const $setting of $settings) {
        $setting.reset(false);
    }

    document.body.addClassTemporarily('blink', 'animationend');
    (new Toast("Réglages par défaut restaurés.")).show();

    checkVisibility();
}

/**
 * Emit an event to notify the change of a setting.
 * @param {string} setting_name
 * @param {string|number|boolean} value
 * @param {'onsync'|'oninit'|'onchange'} [type] The event type to emit. – *Default: `onsync`*
 * @fires setting:`type`:`setting_name`
 */
function emitEvent(setting_name, value, type = 'onsync')
{
    let name = `setting:${type}:${setting_name}`;

    document.dispatchEvent(new CustomEvent(name, { detail: {
        value: value
    }}));

    if (type === 'onchange') console.debugType('emit_event', name, value);
}

/**
 * Bind an event listener to call a callback.
 * @param {string|Array<string>} setting_names The name of the setting(s) to listen.
 * @param {Function} callback The callback to call.
 * @param {'onsync'|'oninit'|'onchange'} type The event type to listen.
 */
function bindEvent(setting_names, callback, type)
{
    setting_names = (typeof setting_names === 'string') ? [setting_names] : setting_names;

    for (let setting_name of setting_names) {
        document.addEventListener(`setting:${type}:${setting_name}`, callback);
    }
}

/**
 * Listen when the setting(s) are initialized.
 * @param {string|Array<string>|null} setting_names The name of the setting(s) to listen,
 *                                                  or `null` to listen to the global `settings:oninit` event.
 * @param {Function} callback The callback to call.
 */
export function oninit(setting_names, callback)
{
    if (setting_names !== null) {
        bindEvent(setting_names, callback, 'oninit');
    } else {
        document.addEventListener('settings:oninit', callback);
    }
}

/**
 * Listen when the setting(s) change.
 * @param {string|Array<string>} setting_names The name of the setting(s) to listen.
 * @param {Function} callback The callback to call.
 */
export function onchange(setting_names, callback)
{
    bindEvent(setting_names, callback, 'onchange');
}

/**
 * Listen when the setting(s) are synchronized (both on `init` and `change`).
 * @param {string|Array<string>} setting_names The name of the setting(s) to listen.
 * @param {Function} callback The callback to call.
 */
export function onsync(setting_names, callback)
{
    bindEvent(setting_names, callback, 'onsync');
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Click on a select item in the modal.
    // REFACTOR Create a custom element to generate a new modal each time it is needed?
    //          In that case, bind the modal to its setting and move this code into the bindEvents() function of SettingList.
    Modal.$modal.addDynamicEventListener('click', '.select-item', function () {
        SettingList.selectItem(this, Modal.$modal);
    });

    // When a view is loaded.
    document.addEventListener('load', event => {

        // If the view loaded is the settings view.
        if (event.detail.$view.id === $view.id) {
            let setting_name = event.detail.setting_name;
            let transition_duration = $view.getCssProperty('transition-duration') - 50;

            // Scroll instantly to the setting, then make it blink.
            highlight(setting_name, transition_duration);

            // Display the scrollbar and make the setting blink if necessary.
            setTimeout(() => {
                $view._Scrollbar.setVisibility(true);
            }, transition_duration);
        }
        else {
            $view._Scrollbar.setVisibility(false);
        }
    });

    // Hide the "Open in browser" setting action if the app is already running in browser.
    const $openInBrowser = $view.querySelector('[data-name=open_in_browser]');
    $openInBrowser.classList.toggle('hide', !ENV.APP.PWA_MODE);

    // Change the gauge parameters.
    onsync('gauge_step', event => {
        let value = parseFloat(event.detail.value);
        $view.querySelector('[data-name=gauge_min]').setStep(value);
        $view.querySelector('[data-name=gauge_max]').setStep(value);
        $view.querySelector('[data-name=danger_zone]').setStep(value);
    });

    // Init the settings.
    init();
}
