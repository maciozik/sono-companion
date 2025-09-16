import Setting from '/js/classes/Setting.js';
import Slider from '/js/classes/Slider.js';
import * as Settings from '/js/views/settings.js';

/**
 * Represents a setting to select a numeric value in a range.
 *
 * The following attributes **must** be declared:
 *  - `data-value` : The default numeric value of the setting.
 *  - `data-min`   : The minimum numeric value of the range.
 *  - `data-max`   : The maximum numeric value of the range.
 *  - `data-step`  : The numeric gap between each value of the range.
 *
 * The `data-min`, `data-max` and `data-step` attributes are called parameters.
 * A parameter can either be a raw numeric value, or a reference to another setting on which its numeric value depends.
 * In that second case, the name of the setting must be enclosed in curly braces (e.g. `{setting_name}`).
 *
 * The following attributes may also be declared optionally:
 *  - `data-suffix` : The suffix to add to the current numeric value when displayed on the setting.
 *
 * @example
 *  <setting-range
 *      data-name="gauge_max" data-title="Gauge maximum" data-suffix=" dB"
 *      data-value="130" data-min="100" data-max="150" data-step="{gauge_step}"
 *  ></setting-range>
 */
export default class SettingRange extends Setting
{
    value = new Number();
    default_value = new Number();
    suffix = new String();

    min = new Number();
    max = new Number();
    step = new Number();

    $slider;
    $settingValue;

    /** @type {Slider} */
    Slider;

    constructor ()
    {
        super();

        this.value = parseFloat(this.dataset.value);
        this.default_value = this.value;
        this.suffix = this.dataset.suffix || "";

        // Get the parameter values.
        this.min  = this.getParameterValue('data-min');
        this.max  = this.getParameterValue('data-max');
        this.step = this.getParameterValue('data-step');

        // Remove the useless attributes.
        this.removeAttribute('data-value');
        this.removeAttribute('data-suffix');
        this.removeAttribute('data-min');
        this.removeAttribute('data-max');
        this.removeAttribute('data-step');
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
        this.$slider = this.querySelector('.slider');
        this.$settingValue = this.querySelector('.slider-value');

        // Create and link the Slider instance to the setting.
        this.Slider = new Slider(this.$slider);

        // Set the width of the setting value.
        this.setSettingValueWidth();

        // Bind the pointer events to the slider, and init it.
        this.Slider.bindEvents();
        this.Slider.setPosition();

        // Set the value on the setting.
        this.setSettingValue();

        // Bind the events to the setting.
        this.bindEvents();
    }

    /**
     * Set the value and the slider thumb position.
     * @param {number} value
     * @returns {number} The new value, after rounding it if necessary.
     */
    set(value)
    {
        // Update the value of the slider.
        value = this.Slider.setValue(value);

        // Update the position of the slider thumb and the setting value.
        this.value = value;
        this.Slider.setPosition();
        this.setSettingValue();

        return this.value;
    }

    /**
     * Set the slider value displayed on the setting.
     */
    setSettingValue()
    {
        this.$settingValue.textContent = this.Slider.getValueWithSuffix();
        this.$settingValue.style.visibility = 'visible';
    }

    /**
     * Lock the width of the setting value to its widest possible value from the range.
     */
    setSettingValueWidth()
    {
        let width = 0;
        this.$settingValue.style.visibility = 'hidden';

        // Fill with all possible values successively, and save the greatest width.
        for (let value in this.Slider.values) {
            this.$settingValue.textContent = this.Slider.getValueWithSuffix(parseFloat(value));
            let current_width = this.$settingValue.offsetWidth;
            width = (width < current_width) ? current_width : width;
        }

        this.$settingValue.style.setProperty('--slider-value-width', `${width + 1}px`);
    }

    setStep(step)
    {
        this.step = step;
        this.Slider.setStep(step);
    }

    /**
     * Get either the raw value of a parameter, or the value of the setting on which it depends.
     * @param {'data-min'|'data-max'|'data-step'} attr
     * @returns {number}
     */
    getParameterValue(attr)
    {
        // Get the name of the setting on which the parameter depends, if it exists.
        let attr_value = this.getAttribute(attr);
        let setting_name = attr_value.match(/^\{(.+)\}$/);

        if (setting_name) {
            return parseFloat(Settings.get(setting_name[1]));
        }
        else {
            return parseFloat(attr_value);
        }
    }

    /**
     * Render the HTML.
     */
    render()
    {
        // Add the class and the tappable options.
        this.classList.add('setting');
        this.dataset.tappable = 'trigger-manually follow-tap';

        // Set the content.
        this.innerHTML = /*html*/`
            <div class="setting-text">
                <p class="setting-title ${ this.danger ? 'danger' : ''}">
                    ${this.title} ${super.getResetButtonHTML()}
                </p>
                ${super.getInfoHTML()}
            </div>
            <div class="setting-choice">
                <div class="slider-value"></div>
            </div>
            <div class="slider" data-value="${this.value}" data-suffix="${this.suffix}" data-min="${this.min}" data-max="${this.max}" data-step="${this.step}">
                <div class="slider-line">
                    <div class="slider-fill"></div>
                    <div class="slider-thumb"></div>
                </div>
            </div>
        `;
    }

    /**
     * Bind some generic events to the setting.
     * Bind the `move`, `change` and `end` events from the slider to update the setting.
     */
    bindEvents()
    {
        super.bindEvents();
        const _this = this;

        // When the slider moves.
        this.$slider.addEventListener('move', function () {

            // Highlight the setting value.
            _this.$settingValue.classList.add('active');
        });

        // When the value of the slider changes.
        this.$slider.addEventListener('change', function (event) {

            // Update the value in the setting.
            _this.value = event.detail.value;
            _this.setSettingValue();
        });

        // When the slider is released.
        this.$slider.addEventListener('end', function (event) {

            // Update the value in the storage.
            Settings.change(_this.name, _this.value, _this.context);

            // Unhighlight the setting value, and trigger the tappable element.
            _this.$settingValue.classList.remove('active');
            _this._Tappable.trigger(event.detail.source_event);

            // Make the device vibrate.
            app.vibrate();
        });
    }

    // These methods are not implemented in this class.
    trigger() { return false; }
}

customElements.define('setting-range', SettingRange);
