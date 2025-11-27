import TriggerHandler from '/js/classes/TriggerHandler.js';

/**
 * Represents a ripple effect on a triggerable element.
 *
 * @description
 * A ripple effect is a growing circle animation that can be run on a triggerable element that received an interaction.
 * It is defined by the presence of the `data-ripple` attribute, on an element that has a `data-trigger` attribute.
 *
 * Several options may be defined as values of this `data-ripple` attribute, separated by spaces:
 *  - `follow-tap`       : The circle animation is triggered at the position of the tap.
 *  - **Any raw number** : The opacity of the circle (e.g. `0.2`).
 *  - **Any duration**   : The animation duration of the circle (e.g. `200ms`).
 *
 * @see {@link TriggerHandler} for available options of the `data-trigger` attribute.
 */

export default class Ripple {

    options = new Array();

    /** @type {TriggerHandler} */
    _TriggerHandler;

    /**
     * @constructor
     * @param {TriggerHandler} _TriggerHandler The instance of {@link TriggerHandler} bind to the triggerable element.
     */
    constructor(_TriggerHandler)
    {
        this._TriggerHandler = _TriggerHandler;
        this.init();
    }

    /**
     * Set and trigger the ripple.
     * @param {Event} event The event that triggered the triggerable element.
     */
    trigger(event)
    {
        let triggerable = this._TriggerHandler.$triggerable.getBoundingClientRect();

        // Define the ripple position, and clamp it inside the element if the pointer overflows.
        let pointer = new DOMPoint(
            Math.clamp((event.clientX - triggerable.left), 0, triggerable.width),
            Math.clamp((event.clientY - triggerable.top), 0, triggerable.height)
        );

        // Set and run the ripple animation.
        this.setPosition(pointer);
        this.run();
    }

    /**
     * Set the position of the ripple (only with `follow-tap` option).
     * @param {DOMPoint} pointer
     * @returns
     */
    setPosition(pointer)
    {
        if (!this.has('follow-tap')) return;

        this._TriggerHandler.$triggerable.style.setProperty('--pointer-x', `${pointer.x}px`);
        this._TriggerHandler.$triggerable.style.setProperty('--pointer-y', `${pointer.y}px`);
    }

    /**
     * Run the ripple animation.
     */
    run()
    {
        this._TriggerHandler.$triggerable.addClassTemporarily('ontap', 'animationend');
    }

    /**
     * Whether the ripple has an option.
     * @param {string} option
     * @returns {boolean}
     */
    has(option)
    {
        return this.options.includes(option);
    }

    /**
     * Initialize the ripple.
     */
    init()
    {
        // Set the options from the `data-ripple` attribute.
        this.options = this._TriggerHandler.$triggerable.dataset.ripple.split(' ');

        // Set the style of the ripple.
        for (let option of this.options) {

            // If the option is a number.
            if (isFinite(option)) {
                this._TriggerHandler.$triggerable.style.setProperty('--ripple-opacity', option);
            }

            // If the option is a duration.
            if (option.endsWith('ms') || option.endsWith('s')) {
                this._TriggerHandler.$triggerable.style.setProperty('--ripple-animation-duration', option);
            }
        }
    }
}
