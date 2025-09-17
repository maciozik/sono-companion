import * as Settings from '/js/views/settings.js';

export const MIN    = () => Settings.get('gauge_min');
export const MAX    = () => Settings.get('gauge_max');
export const DANGER = () => Settings.get('danger_zone');
export const GRADUATIONS_STEP = () => Settings.get('gauge_step');

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
    let min = MIN(),
        max = MAX(),
        danger = DANGER(),
        half = (max + min) / 2,
        step = GRADUATIONS_STEP(),
        nb_values = ((max - min) / step) + 1;

    // Rotate the gauge arcs
    let gauge_rotation = convertToDegree(danger - min);
    $gaugeArcs.style.setProperty('--gauge-arcs-rotation', `${gauge_rotation}deg`);

    // Rotate the safe gauge a bit more to create the gap between the two gauges.
    let arc_safe_rotation = convertToDegree((-1 * step));
    $gaugeArcSafe.style.transform = `rotate(${arc_safe_rotation}deg) translate3D(0, 0, 0)`;

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
            let rotation = convertToDegree(value - danger + step);
            $graduation.style.transform = `rotate(${rotation}deg)`;
            $gaugeArcSafe.querySelector('.gauge-graduations').appendChild($graduation);
        }
        else {
            let rotation = convertToDegree(value - danger);
            $graduation.style.transform = `rotate(${rotation}deg)`;
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

    // Clamp between the minimum and the maximum limits.
    db = Math.clamp(db, MIN(), MAX());

    // Shine the graduations values.
    for (const $graduation of $graduations) {
        $graduation.classList.remove('active');
        if ($graduation.dataset.value <= db && db > MIN()) {
            $graduation.classList.add('active');
        }
    }

    // Rotate the pointer.
    let rotation = convertToDegree(db - MIN());
    $gaugePointer.style.transform = `rotate(${rotation}deg)`;
}

// REMOVE Not used for the moment.
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
    return value * 180 / (MAX() - MIN());
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__()
{
    // Create the gauge once the settings are initialized.
    Settings.oninit(null, create);

    // Recreate the gauge if the settings change.
    Settings.onchange(['gauge_min', 'gauge_max', 'danger_zone', 'gauge_step'], recreate);
}
