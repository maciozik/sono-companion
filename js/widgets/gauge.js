import * as Settings from '/js/views/settings.js';

const DANGER_INDICATOR = "Danger";

export const $gauge = document.querySelector('#sonometer #sonometer-gauge .gauge');
const $gaugeArcs = $gauge.querySelector('.gauge-arcs');
const $gaugeArcSafe = $gaugeArcs.querySelector('.gauge-arc-safe');
const $gaugeArcDanger = $gaugeArcs.querySelector('.gauge-arc-danger');
const $gaugePointer = $gauge.querySelector('.gauge-pointer');

/**
 * Create the gauge.
 */
export function create()
{
    const min       = STG.gauge_min,
          max       = STG.gauge_max,
          danger    = STG.danger_zone,
          half      = (max + min) / 2,
          step      = STG.gauge_step,
          nb_values = ((max - min) / step) + 1;

    // Rotate the gauge arcs
    const gauge_rotation = convertToDegree(danger - min);
    $gaugeArcs.style.setProperty('--gauge-arcs-rotation', `${gauge_rotation}deg`);

    // Rotate the safe gauge a bit more to create the gap between the two gauges.
    const arc_safe_rotation = convertToDegree((-1 * step));
    $gaugeArcSafe.style.rotate = `${arc_safe_rotation}deg`;

    // Reduce the number of displayed values if there are too many.
    $gaugeArcs.classList.toggle('reduce-values', (nb_values >= 20));

    for (let value = min; value <= max; value += step) {

        // Get the template of the graduation and clone it.
        /** @type {DocumentFragment} */
        const $graduationTemplate = document.getElementById('gauge-graduation-template').content;
        /** @type {HTMLElement} */
        const $graduation = $graduationTemplate.cloneNode(true).querySelector('.graduation');

        // Set the values of the graduation.
        $graduation.dataset.value = value;

        // Set the right orientation of the indicator.
        if (value > half) {
            $graduation.classList.add('indicator-reverse');
        }

        // Show the danger indicator at the right graduation.
        if (value === danger) {
            $graduation.dataset.indicator = DANGER_INDICATOR;
        }

        // Rotate and add the graduation to the right gauge.
        if (value < danger) {
            const rotation = convertToDegree(value - danger + step);
            $graduation.style.rotate = `${rotation}deg`;
            $gaugeArcSafe.querySelector('.gauge-graduations').appendChild($graduation);
        }
        else {
            const rotation = convertToDegree(value - danger);
            $graduation.style.rotate = `${rotation}deg`;
            $gaugeArcDanger.querySelector('.gauge-graduations').appendChild($graduation);
        }
    }
}

/**
 * Recreate the gauge.
 */
export function recreate()
{
    requestAnimationFrame(() => {
        $gaugeArcs.style.setProperty('--gauge-arcs-rotation', `0deg`);
        $gaugeArcSafe.style.transform = '';
        $gaugeArcs.querySelectorAll('.graduation').forEach(graduation => graduation.remove());

        create();
    });
}

/**
 * Set the volume of the gauge.
 * @param {number} db
 */
export function update(db)
{
    const $graduations = $gauge.getElementsByClassName('graduation');
    const min = STG.gauge_min;
    const max = STG.gauge_max;

    // Clamp between the minimum and the maximum limits.
    db = Math.clamp(db, min, max);

    // Shine the graduations values.
    for (const $graduation of $graduations) {
        $graduation.classList.remove('active');
        if ($graduation.dataset.value <= db && db > min) {
            $graduation.classList.add('active');
        }
    }

    // Rotate the pointer.
    const rotation = convertToDegree(db - min);
    $gaugePointer.style.rotate = `${rotation}deg`;
}

/**
 * Set the transition duration of the pointer.
 * @param {number} duration The duration of the transition (in ms).
 */
export function setTransitionDuration(duration)
{
    $gauge.style.setProperty('--gauge-pointer-transition-duration', `${duration}ms`);
}

/**
 * Convert the value into degree.
 * @param {number} value
 * @returns {number}
 */
function convertToDegree(value)
{
    return value * 180 / (STG.gauge_max - STG.gauge_min);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Create the gauge once the settings are initialized.
    Settings.oninit(create);

    // Recreate the gauge if the settings change.
    Settings.onchange(['gauge_min', 'gauge_max', 'danger_zone', 'gauge_step'], recreate);

    // Set the sensitivity of the pointer.
    Settings.onsync('gauge_sensitivity', event => {
        setTransitionDuration(parseInt(event.detail.value));
    });
}
