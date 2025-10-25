import * as Tempo from '/js/views/tempo.js';

export const $view = document.getElementById('toolbox');
const $inputs = $view.querySelectorAll('input[type="number"]');

function setInput($input, value)
{
    if (value <= 0 || value === null || isNaN(value)) {
        $input.value = "";
        return;
    }

    $input.value = Math.round(value);
}

/**
 * Convert from a unit to another.
 * @param {number} value
 * @param {'bpm'|'ms'|'m'} unit_from The unit of the initial value.
 * @param {'bpm'|'ms'|'m'} unit_to The unit to convert to.
 * @returns {number|null}
 */
function convert(value, unit_from, unit_to)
{
    return Tempo.convert(value, unit_from, unit_to);
}

/**
 * Parse and validate the input value.
 * @param {HTMLInputElement} $input
 * @returns {boolean} False if the value is invalid.
 */
function validateInput($input)
{
    let min = parseInt($input.getAttribute('min'));
    let max_length = parseInt($input.getAttribute('maxlength'));

    // Remove non-numeric characters.
    $input.value = $input.value.replace(/[^0-9]/g, "");

    // Trim leading zeros.
    if (/^0+$/.test($input.value)) {
        $input.value = "0";
    } else {
        $input.value = $input.value.replace(/^0+/, "");
    }

    // Invalidate the value if it is below the minimum, with feedback.
    if ($input.value < min) {
        $input.closest('.input').classList.add('error');
        return false;
    } else {
        $input.closest('.input').classList.remove('error');
    }

    // Limit the length, with feedback.
    if ($input.value.length > max_length) {
        $input.value = $input.value.slice(0, max_length);
        $input.closest('.input').addClassTemporarily('error', 150);
    }

    return true;
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    for (const $input of $inputs) {

        // Click on an input container.
        $input.closest('.input').addEventListener('click', function () {
            this.querySelector('input').focus();
        });

        // Limit the length of number inputs.
        $input.addEventListener('input', function () {

            let valid = validateInput(this);

            const $target = document.getElementById(this.dataset.targetId);
            let unit_from = this.dataset.unit;
            let unit_to = $target.dataset.unit;

            let converted_value = convert(parseInt(this.value), unit_from, unit_to);
            setInput($target, (valid ? converted_value : null));
        });

        // Select all input on focus.
        $input.addEventListener('focus', function () {
            this.select();
        });

        // Remove input value if invalid when it loses focus.
        $input.addEventListener('blur', function () {
            let valid = validateInput(this);
            if (!valid) {
                this.value = "";
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
}
