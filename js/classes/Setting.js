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
     * @abstract This method **must** be implemented in the child classes.
     */
    trigger()
    {
        console.error('The method trigger() is not implemented.');
        return false;
    }

    /**
     * Set the value of the setting.
     * @abstract This method **must** be implemented in the child classes.
     * @returns {boolean} False if the value cannot be set.
     */
    set()
    {
        console.error('The method set() is not implemented.');
        return false;
    }

    /**
     * Render the HTML.
     * @abstract This method **must** be implemented in the child classes.
     */
    render()
    {
        console.error('The method render() is not implemented.');
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
     * Get the HTML of the info tag if there is an info to show.
     * @returns {string|''}
     */
    getInfoHTML()
    {
        return (this.info !== "") ? `
            <p class="setting-info">${this.info}</p>
        ` : '';
    }

    /**
     * Get the HTML of the reset button if the setting allow the reset.
     * @returns {string|''}
     */
    getResetButtonHTML()
    {
        return (this.allow_reset) ? `
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
            let is_default = event.detail.value === this.default_value;
            this.getResetButton()?.classList.toggle('hide', is_default);
        });

        // Wait for all the settings to be initialized.
        Settings.oninit(null, this.setParentSettings());
    }
}
