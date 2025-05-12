import * as Settings from '../modules/settings.js';

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
        this.info = this.dataset.info || "";

        this.allow_reset = (this.dataset.allowReset === undefined || this.dataset.allowReset === 'false') ? false : true;
        this.danger = (this.dataset.danger === undefined || this.dataset.danger === 'false') ? false : true;
        this.groups = this.dataset.groups?.split(' ') || [];

        this.bindEvents();

        // Remove the useless attributes.
        this.removeAttribute('data-title');
        this.removeAttribute('data-info');
        this.removeAttribute('data-allow-reset');
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
     * @abstract This method **must** be implemented in the `Setting*` child classes, if the user can click it.
     */
    trigger()
    {
        console.error('The method trigger() is not implemented.');
        return false;
    }

    /**
     * Set the value of the setting.
     * @abstract This method **must** be implemented in the `Setting*` child classes, if the type of setting admits a value.
     * @returns {boolean} False if the value cannot be set.
     */
    set()
    {
        console.error('The method set() is not implemented.');
        return false;
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
     * Reset the setting to its default value.
     */
    reset(vibrate = true)
    {
        this.set(this.default_value);
        Settings.change(this.name, this.default_value, this.context);

        if (vibrate) app.vibrate();
    }

    /**
     * Get the info tag if there is an info to show.
     * @returns {string|''}
     */
    getInfoHTML()
    {
        return (this.info !== "") ? `
            <p class="setting-info">${this.info}</p>
        ` : '';
    }

    /**
     * Get the reset button if the setting allow the reset.
     * @returns {string|''}
     */
    getResetButtonHTML()
    {
        return (this.allow_reset) ? `
            <g-icon class="reset-btn" data-name="restore"></g-icon>
        ` : '';
    }

    /**
     * Bind events to the setting.
     */
    bindEvents()
    {
        // Wait for all the settings to be initialized.
        Settings.oninit(null, this.setParentSettings());
    }
}
