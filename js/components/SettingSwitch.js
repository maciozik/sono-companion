import Setting from '../classes/Setting.js';
import * as Settings from '../modules/settings.js';

export default class SettingSwitch extends Setting
{
    value = new Boolean();
    default_value = new Boolean();

    $switch;

    constructor ()
    {
        super();

        this.value = (this.dataset.value === 'true') ? true : false;
        this.default_value = this.value;

        // Remove the useless attributes.
        this.removeAttribute('data-value');
    }

    /**
     * When the element is connected to the DOM.
     */
    connectedCallback()
    {
        super.connectedCallback();

        // Render the setting.
        this.render();

        // Set the necessary elements.
        this.$switch = this.querySelector('.switch');
    }

    /**
     * Entry point at a user interaction.
     */
    trigger()
    {
        this.toggle();
    }

    /**
     * Set the value of the switch.
     * @param {boolean} value
     * @returns {true}
     */
    set(value)
    {
        this.value = value;
        this.$switch.dataset.value = this.value;

        return true;
    }

    /**
     * Toggle the value of the switch.
     */
    toggle()
    {
        let value = (this.value === true) ? false : true;

        // Set the value of the switch.
        this.set(value);

        // Store the setting in the storage.
        Settings.change(this.name, this.value, this.context);

        // Check if the visibility of some settings must change.
        Settings.checkVisibility();

        // Make the device vibrate (longer for the allow_vibrations setting).
        let vibration_duration = (this.name === 'allow_vibrations') ? 300 : ((this.value) ? 30 : 10);
        app.vibrate(vibration_duration);
    }

    /**
     * Render the HTML.
     */
    render()
    {
        // Add the class and the tappable options.
        this.classList.add('setting');
        this.dataset.tappable = 'click follow-tap';

        // Set the content.
        this.innerHTML = `
            <div class="setting-text">
                <p class="setting-title ${ this.danger ? 'danger' : ''}">
                    ${this.title} ${super.getResetButtonHTML()}
                </p>
                ${super.getInfoHTML()}
            </div>
            <div class="setting-choice">
                <div class="switch" data-value=${this.value}></div>
            </div>
        `;
    }
}

customElements.define('setting-switch', SettingSwitch);
