import '/js/utils/htmlelement/hasBooleanAttribute.js';
import * as Settings from '/js/views/settings.js';

/**
 * @typedef {import('../custom-elements/SettingSwitch.js')} SettingSwitchImport
 */

/**
 * Represents a general setting.
 * @abstract This class must only be extended and should **not** be instantiated directly.
 *
 * The following global attributes **must** be declared on all settings:
 *  - `data-name`  : The id of the setting that will be used as key in the storage (in snake case).
 *  - `data-title` : The main title of the setting.
 *
 * The following global attributes may also be declared optionally on any setting:
 *  - `data-info`        : The description that gives more information about the setting.
 *  - `data-allow-reset` : Whether the setting can be set to its default value with a reset button.
 *  - `data-danger`      : Whether the setting must be considered as a "sensitive" setting.
 *  - `data-groups`      : One or several groups (in snake case and separated by spaces) that can be enabled or
 *                         disabled when the value of a {@link SettingSwitchImport.default SettingSwitch} changes.
 */
export default class Setting extends HTMLElement
{
    name = new String();
    context = new String();
    allow_reset = new Boolean();
    danger = new Boolean();

    title = new String();
    info = new String();

    /** @type {Array<string|undefined>} */
    groups = new Array();

    /**
     * Other settings that can disable this setting on true or false.
     * @type {Map<Setting, boolean>}
     */
    parent_settings = new Map();

    constructor ()
    {
        super();

        this.name = this.dataset.name;
        this.title = this.dataset.title;
        this.info = this.dataset.info ?? "";

        this.allow_reset = this.hasBooleanAttribute('data-allow-reset');
        this.danger = this.hasBooleanAttribute('data-danger');
        this.groups = this.dataset.groups?.split(' ') ?? [];

        // Remove the useless attributes.
        this.removeAttribute('data-title');
        this.removeAttribute('data-info');
        this.removeAttribute('data-allow-reset');
        this.removeAttribute('data-danger');

        // Add the attributes again without values for CSS purpose.
        this.toggleAttribute('data-danger', this.danger);
    }

    /**
     * When the element is connected to the DOM.
     */
    connectedCallback()
    {
        this.context = this.closest('section').dataset.context;
    }

    /**
     * Entry point at a user interaction.
     * @abstract This method **must** be implemented in the child classes.
     */
    trigger()
    {
        console.error("The method trigger() is not implemented.");
        return false;
    }

    /**
     * Set the value of the setting.
     * @abstract This method **must** be implemented in the child classes.
     * @returns {string|number|boolean|undefined} The new value (can be different if the value is not valid and changes),
     *                                            or `undefined` if it cannot be set.
     */
    set()
    {
        console.error("The method set() is not implemented.");
        return undefined;
    }

    /**
     * Render the HTML.
     * @abstract This method **must** be implemented in the child classes.
     */
    render()
    {
        console.error("The method render() is not implemented.");
        return undefined;
    }

    /**
     * Set the visibility (disabled or not) of the setting.
     * @param {boolean} is_visible
     */
    setVisibility(is_visible)
    {
        this.classList.toggle('disabled', !is_visible);
    }

    /**
     * Set the all the switch parent settings that can disable this setting.
     */
    setParentSettings()
    {
        for (let group of this.groups) {

            // Get all the parent settings that can disable the group.
            const $parent_settings_disable_on_true = document.querySelectorAll(`
                setting-switch[data-disable-group-on-true=${group}]
            `);
            const $parent_settings_disable_on_false = document.querySelectorAll(`
                setting-switch[data-disable-group-on-false=${group}]
            `);

            // Add the settings with a boolean as value that represents if it can disable the group on true or on false.
            $parent_settings_disable_on_true.forEach($setting => {
                this.parent_settings.set($setting, true);
            });
            $parent_settings_disable_on_false.forEach($setting => {
                this.parent_settings.set($setting, false);
            });
        }
    }

    /**
     * Set the setting to its default value.
     * @return {string|number|boolean} The default value.
     */
    setToDefault()
    {
        this.set(this.default_value);
        return this.default_value;
    }

    /**
     * Set the setting to its default value and update it in the storage.
     */
    reset(vibrate = true)
    {
        this.setToDefault();
        Settings.change(this.name, this.default_value, this.context);

        if (vibrate) app.vibrate();
    }

    /**
     * Get the HTML of the info tag if there is an info to show.
     * @returns {string|''}
     */
    getInfoHTML()
    {
        return (this.info !== "") ? /*html*/`
            <p class="setting-info">${this.info}</p>
        ` : '';
    }

    /**
     * Get the HTML of the reset button if the setting allow the reset.
     * @returns {string|''}
     */
    getResetButtonHTML()
    {
        return (this.allow_reset) ? /*html*/`
            <g-icon class="reset-btn" data-name="restore" data-tappable="click no-circle"></g-icon>
        ` : '';
    }

    /**
     * Get the reset button.
     * @returns {HTMLElement|null}
     */
    getResetButton()
    {
        return this.querySelector('.reset-btn');
    }

    /**
     * Bind some generic events to the setting.
     * This method **should** be implemented in the child classes.
     */
    bindEvents()
    {
        // Click on the setting.
        this.addEventListener('trigger', () => {
            this.trigger();
        });

        // Click on the reset button.
        this.getResetButton()?.addEventListener('trigger', () => {
            this.reset();
        });

        // Show or hide the reset button when the setting changes.
        Settings.onsync(this.name, (event) => {
            let is_default = event.detail.value == this.default_value;
            this.getResetButton()?.classList.toggle('hide', is_default);
        });

        // Wait for all the settings to be initialized.
        Settings.oninit(null, this.setParentSettings());
    }
}
