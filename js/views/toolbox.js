import * as Settings from '/js/views/settings.js';

export const $view = document.getElementById('toolbox');

const $inputs = $view.querySelectorAll('input');
const $temperatureBadge = $view.querySelector('.temperature-badge');

const SPEED_OF_SOUND_DEFAULT = 340; // In m/s.

/**
 * Set the value of an input.
 * @param {HTMLInputElement} $input
 * @param {number|null} value
 */
function setInput($input, value)
{
    if (value === null || isNaN(value)) {
        $input.value = "";
        return;
    }

    $input.value = Math.round(value);
}

/**
 * Convert a value from a unit to another.
 * @param {number} value
 * @param {'bpm'|'ms'|'m'} unit_from The unit of the initial value.
 * @param {'bpm'|'ms'|'m'} unit_to The unit to convert to.
 * @param {boolean} [useTemperature] Whether to use the temperature setting to define the speed of sound.
 * @returns {number|null}
 */
export function convert(value, unit_from, unit_to, useTemperature = true)
{
    if (value === 0 || isNaN(value)) return null;

    let bpm = new Number();
    let converted_value = new Number();

    let speed_of_sound = (useTemperature ? getSpeedOfSound() : SPEED_OF_SOUND_DEFAULT);

    // First convert to bpm.
    switch (unit_from) {
        case 'bpm': bpm = value; break;
        case 'ms' : bpm = 60000 / value; break;
        case 'm'  : bpm = 60 / (value / speed_of_sound); break;
    }
    // Then convert to the target unit.
    switch (unit_to) {
        case 'bpm': converted_value = bpm; break;
        case 'ms' : converted_value = Math.round(60000 / bpm); break;
        case 'm'  : converted_value = Math.round(speed_of_sound * (60 / bpm)); break;
    }

    return converted_value;
}

/**
 * Clean and validate the input value.
 * @param {HTMLInputElement} $input
 * @returns {boolean} False if the value is invalid.
 */
function validateInput($input)
{
    let min = parseInt($input.min);
    let max = parseInt($input.max);
    let max_length = parseInt($input.dataset.maxlength);

    // Remove non-numeric characters.
    $input.value = $input.value.replace(/[^0-9]/g, "");

    // Trim leading zeros.
    if (/^0+$/.test($input.value)) {
        $input.value = "0";
    } else {
        $input.value = $input.value.replace(/^0+/, "");
    }

    // Limit the length, with feedback.
    if ($input.value.length > max_length) {
        $input.value = $input.value.slice(0, max_length);
        $input.closest('.input').addClassTemporarily('above-maxlength', 150);
    }

    // Invalidate the value if out of range, with feedback.
    if ($input.value < min || $input.value > max) {
        $input.closest('.input').dataset.validationRange = `${$input.min} – ${$input.max}`;
        $input.closest('.input').classList.add('out-of-range');
        return false;
    } else {
        $input.closest('.input').classList.remove('out-of-range');
    }

    return true;
}

/**
 * Get the speed of sound depending on the temperature setting.
 * @returns {number}
 */
function getSpeedOfSound()
{
    return 20.05 * Math.sqrt(273.15 + STG.temperature);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
// TODO Extract some code to an input component.
export function __init__()
{
    for (const $input of $inputs) {

        // Click on an input container.
        $input.closest('.input').addEventListener('click', function () {
            this.querySelector('input').focus();
        });

        // When the user type.
        $input.addEventListener('input', function () {
            const $target = document.getElementById(this.dataset.targetId);
            let unit_from = this.dataset.unit;
            let unit_to = $target.dataset.unit;

            // Validate the input value, then set the converted value.
            let valid = validateInput(this);
            let converted_value = convert(parseInt(this.value), unit_from, unit_to);
            setInput($target, (valid ? converted_value : null));
        });

        // Select all input on focus.
        $input.addEventListener('focus', function () {
            this.select();
        });

        // Remove input value if invalid when it loses focus.
        $input.addEventListener('blur', function () {
            if (!validateInput(this)) { this.value = ""; }
            this.closest('.input').classList.remove('above-maxlength', 'out-of-range');
        });

        // Input loses focus on validate key.
        $input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                this.blur();
            }
        });

        // Disable the context menu.
        $input.addEventListener('contextmenu', event => event.preventDefault());
    }

    // Click on an arrow that allows swap.
    const $arrows = $view.querySelectorAll('.arrow.swap');
    for (const $arrow of $arrows) {

        $arrow.addEventListener('trigger', function () {

            const $input_left = document.getElementById(this.dataset.targetIdLeft);
            const $input_right = document.getElementById(this.dataset.targetIdRight);

            let value_left = $input_left.value;
            $input_left.value = $input_right.value;
            $input_right.value = value_left;
        });
    }

    // When the temperature setting changes.
    Settings.onsync('temperature', event => {

        const $input_from = $view.querySelector('#delay-converter #delay-m');
        const $input_to = $view.querySelector('#delay-converter #delay-ms');
        const $speed_of_sound = $view.querySelector('#delay-converter .speed_of_sound');

        // Set the temperature badge.
        const $temperature_setting_value = Settings.$view.querySelector('[data-name="temperature"] .slider-value');
        $temperatureBadge.textContent = $temperature_setting_value.textContent;

        // Update the conversion and the max attribute of the `delay-ms` input
        $input_to.value = convert(parseInt($input_from.value), 'm', 'ms') ?? "";
        $input_to.max = convert(parseInt($input_from.max), 'm', 'ms');

        // Show the speed of sound.
        $speed_of_sound.textContent = Math.round(getSpeedOfSound()) + " m/s";
    });
}
