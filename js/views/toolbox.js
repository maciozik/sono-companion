import Scrollbar from '/js/classes/Scrollbar.js';
import Toast from '/js/classes/Toast.js';
import * as Storage from '/js/core/storage.js';
import * as Settings from '/js/views/settings.js';
import * as FullscreenTextarea from '/js/components/fullscreen-textarea.js';

export const $view = document.getElementById('toolbox');

const $inputs = $view.querySelectorAll('input');
const $temperatureBadge = $view.querySelector('.temperature-badge');
const $notepad = $view.querySelector('textarea#notepad');

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
    const $inputBox = $input.closest('.input-box');
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
        $inputBox.addClassTemporarily('above-maxlength', 150);
    }

    // Invalidate the value if out of range, with feedback.
    if ($input.value < min || $input.value > max) {
        $inputBox.dataset.validationRange = `${$input.min} – ${$input.max}`;
        $inputBox.classList.add('out-of-range');
        return false;
    } else {
        $inputBox.classList.remove('out-of-range');
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
 * Restore the notepad content from the storage.
 */
function notepadRestoreFromStorage(content)
{
    $notepad.value = Storage.get('toolbox.notepad') ?? "";
}

/**
 * Save the notepad content in the storage.
 */
// TODO Persist the data better? (IndexedDB/.txt)
function notepadSaveInStorage()
{
    let notepad_content = $notepad.value;

    if (notepad_content !== "") {
        Storage.set('toolbox.notepad', notepad_content);
    } else {
        Storage.remove('toolbox.notepad');
    }
}

/**
 * Reset all the saves from the list.
 */
export function notepadReset()
{
    $notepad.value = "";
    Storage.remove('toolbox.notepad');

    (new Toast("Bloc-notes effacé.")).show();
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    notepadRestoreFromStorage();

    for (const $input of $inputs) {

        // When the user types.
        $input.addEventListener('input', function () {
            const $target = document.getElementById(this.dataset.targetId);
            let unit_from = this.dataset.unit;
            let unit_to = $target.dataset.unit;

            // Validate the input value, then set the converted value.
            let valid = validateInput(this);
            let converted_value = convert(parseInt(this.value), unit_from, unit_to);
            setInput($target, (valid ? converted_value : null));
        });

        // Remove input value if invalid when it loses focus.
        $input.addEventListener('blur', function () {
            if (!validateInput(this)) { this.value = ""; }
            this.closest('.input-box').classList.remove('above-maxlength', 'out-of-range');
        });
    }

    // Click on an arrow that allows swap.
    const $arrows = $view.querySelectorAll('.arrow.swap');
    for (const $arrow of $arrows) {

        $arrow.addEventListener('trigger', function () {

            const $inputLeft = document.getElementById(this.dataset.targetIdLeft);
            const $inputRight = document.getElementById(this.dataset.targetIdRight);

            let value_left = $inputLeft.value;
            $inputLeft.value = $inputRight.value;
            $inputRight.value = value_left;
        });
    }

    // When the temperature setting changes.
    Settings.onsync('temperature', event => {

        const $inputFrom = $view.querySelector('#toolbox-delay-converter input#delay-m');
        const $inputTo = $view.querySelector('#toolbox-delay-converter input#delay-ms');
        const $speedOfSound = $view.querySelector('#toolbox-delay-converter .speed_of_sound');

        // Set the temperature badge.
        const $temperatureSettingValue = Settings.$view.querySelector('[data-name="temperature"] .slider-value');
        $temperatureBadge.textContent = $temperatureSettingValue.textContent;

        // Update the conversion and the max attribute of the `delay-ms` input
        $inputTo.value = convert(parseInt($inputFrom.value), 'm', 'ms') ?? "";
        $inputTo.max = convert(parseInt($inputFrom.max), 'm', 'ms');

        // Show the speed of sound.
        $speedOfSound.textContent = Math.round(getSpeedOfSound()) + " m/s";
    });

    // Open the fullscreen textarea when the notepad is focused.
    $notepad.addEventListener('focus', function () {
        FullscreenTextarea.open($notepad, {
            paddingInline : this.getCssProperty('--fullscreen-textarea-padding-sides', false),
            fontSize      : this.getCssProperty('font-size', false),
            lineHeight    : this.getCssProperty('line-height', false)
        });
    });

    // Save the notepad content in storage while the user is typing.
    $notepad.addEventListener('input', function () {
        notepadSaveInStorage();
    });

    // When the edition in the fullscreen textarea is done.
    $notepad.addEventListener('edit-done', function () {
        this.value = this.value.trimEnd();
        notepadSaveInStorage();

        this.addClassTemporarily('edit-done');
    });

    // Highlight the notepad content on scroll.
    if ('onscrollend' in window) {
        $notepad.addEventListener('scroll',    () => { $notepad.classList.add('highlight'); });
        $notepad.addEventListener('scrollend', () => { $notepad.classList.remove('highlight'); });
    }
}
