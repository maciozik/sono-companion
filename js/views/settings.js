import Modal from '../classes/Modal.js';
import Setting from '../classes/Setting.js';
import SettingList from '../custom-elements/SettingList.js';
import SettingAction from '../custom-elements/SettingAction.js';
import * as Storage from '../core/storage.js';

export const $view = document.getElementById('settings');

/** @type {Array<Setting>} */
export const $settings = $view.getElementsByClassName('setting');

/**
 * Get a setting from the storage.
 * @param {string} setting_name The name of the setting (in snake case).
 * @returns {string|number|boolean|null}
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
 * @param {string|number|boolean|null} value The value to set, or null to remove the setting from the storage.
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
 * Change a setting in the storage.
 * @param {string} setting_name The name of the setting (in snake case).
 * @param {string|number|boolean} value The value to set.
 * @param {string} context The context of the setting (i.e. the id of the view, or a keyword).
 * @fires setting:onchange:`setting_name`
 * @fires setting:onsync:`setting_name`
 * @returns {string|number|boolean|null} The value after conversion.
 */
export function change(setting_name, value, context)
{
    let converted_value = set(setting_name, value, context);

    // Emit the 'onchange' and 'onsync' events.
    emitEvent(setting_name, converted_value, 'onchange');
    emitEvent(setting_name, converted_value, 'onsync');

    return converted_value;
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
 * @param {string|number|boolean|null} value The value to set, or null to remove the setting from the storage.
 * @returns {boolean} False if the value cannot be set.
 */
function setInView(setting_name, value)
{
    let $setting = getSettingFromName(setting_name);
    let is_updated = true;

    // Set the setting if it is possible.
    is_updated = $setting.set(value);

    return is_updated;
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

            let $parent_setting = parent_setting[0];
            let on = parent_setting[1];

            // If that parent setting that disable on true is true / that disable on false is false,
            // disable this child setting, then continue to the next setting.
            if ($parent_setting.value === on) {
                $setting.setVisibility(false);
                continue settings_loop;
            }
        }

        // Else, enable this setting.
        $setting.setVisibility(true);
    }
}

/**
 * Make the setting blink after scrolling to it.
 * @param {string} setting_name
 */
export function blink(setting_name)
{
    let $setting = getSettingFromName(setting_name);

    $setting.scrollIntoView({
        behavior: 'smooth',
        block: 'center'
    });

    $setting.addClassTemporarily('blink', 'animationend');
}

/**
 * Get the setting element with the name given.
 * @param {string} setting_name
 * @returns {HTMLElement}
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
export function init()
{
    let settings = new Array();

    for (const $setting of $settings) {

        if ($setting instanceof SettingAction) continue;

        // Get the value from the storage.
        let value = get($setting.name);
        let is_updated = true;

        // If the setting is already in the storage.
        if (value !== null) {
            is_updated = setInView($setting.name, value);
        }

        // If the setting is not in the storage yet or is not a valid JSON,
        // or if its value is not valid.
        if (value === null || !is_updated) {

            // Get the default value from the view.
            value = getFromView($setting.name);

            // Store the setting in the storage, after removing if it exists.
            remove($setting.name, $setting.context);
            set($setting.name, value, $setting.context);

            console.debugType('create_key', `setting.${$setting.context}.${$setting.name}`, value);
        }

        settings.push({ name: $setting.name, value: value });
    }

    // When everything is loaded.
    window.addEventListener('load', () => {

        // Emit the 'oninit' and 'onsync' events on all settings.
        for (let setting of settings) {
            emitEvent(setting.name, setting.value, 'oninit');
            emitEvent(setting.name, setting.value, 'onsync');
        }

        // Emit the global 'settings:oninit' event.
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

    app.vibrate(30);
    document.body.addClassTemporarily('blink', 'animationend');

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
 *                                                  or null to listen to the global `settings:oninit` event.
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
 * @param {Object} modules All the main modules loaded in app.js, got via destructuring.
 */
export function __init__({})
{
    // Click on a select item in the modal.
    // REFACTOR Create a custom element to generate a new modal each time it is needed?
    //          In that case, bind the modal to its setting and move this code into the bindEvents() function of SettingList.
    Modal.$modal.addDynamicEventListener('click', '.select-item', function () {
        SettingList.selectItem(this, Modal.$modal);
    });

    // When the view is loaded.
    document.addEventListener('load', event => {

        const view_id = event.detail.view_id;
        const setting_name = event.detail.setting_name;

        // Make the setting blink if necessary.
        if (view_id === 'settings' && setting_name !== undefined) {
            let transition = window.getComputedStyle($view).getPropertyValue('transition-duration');
            let settings_view_transition_duration = transition.endsWith('s') ? parseFloat(transition) * 1000 : parseFloat(transition);

            setTimeout(() => {
                blink(setting_name);
            }, settings_view_transition_duration - 100);
        }
    });

    // Change the gauge parameters.
    // TODO Finish.
    onsync('gauge_step', event => {
        document.querySelector('.setting[data-name=gauge_min]').setStep(event.detail.value);
        document.querySelector('.setting[data-name=gauge_max]').setStep(event.detail.value);
        document.querySelector('.setting[data-name=danger_zone]').setStep(event.detail.value);
    });

    // Init the settings.
    init();
}
