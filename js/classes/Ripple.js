/**
 * Represents a ripple effect on a rippleable element.
 *
 * @description
 * A ripple effect is a growing circle animation that can be run in the background of an element.
 * It is defined by the presence of the `data-ripple` attribute, and often follows an interaction with the element.
 *
 * Several options may be defined as values of this `data-ripple` attribute, separated by spaces:
 *  - `follow-pointer`   : The ripple effect is run at the position of the user interaction, instead of at its center.
 *  - **Any raw number** : The opacity of the circle (e.g. `0.2`).
 *  - **Any duration**   : The animation duration of the circle (in ms or s).
 *
 * The {@link run} method is accessible via the `_Ripple` instance bind to the rippleable element.
 */

export default class Ripple {

    options = new Array();

    /** @type {HTMLElement & { _Ripple: Ripple }} The element to apply the ripple effect on. */
    $rippleable;

    /**
     * @constructor
     * @param {HTMLElement} $rippleable
     */
    constructor($rippleable)
    {
        this.$rippleable = $rippleable;
        this.options = this.$rippleable.dataset.ripple.split(' ');

        this.setStyle();

        // Bind this instance to the DOM element.
        this.$rippleable._Ripple = this;
    }

    /**
     * Set the position of the ripple effect if necessary, and run it.
     *
     * Can be called from outside:
     * ```js
     * $rippleable._Ripple.run(event);
     * ```
     *
     * @param {Event} [event] The event that triggered the rippleable element.
     */
    run(event)
    {
        if (event !== undefined) {
            this.setPosition(event);
        }

        this.$rippleable.addClassTemporarily('ontap', 'animationend');
    }

    /**
     * Set the position of the ripple (only with the `follow-pointer` option).
     * @param {Event} event The event that triggered the rippleable element.
     * @returns
     */
    setPosition(event)
    {
        if (!this.has('follow-pointer')) return;

        let rippleable = this.$rippleable.getBoundingClientRect();

        // Define the ripple origin position, and clamp it inside the element if the pointer overflows.
        let pointer = {
            x: Math.clamp((event.clientX - rippleable.left), 0, rippleable.width),
            y: Math.clamp((event.clientY - rippleable.top), 0, rippleable.height)
        };

        this.$rippleable.style.setProperty('--pointer-x', `${pointer.x}px`);
        this.$rippleable.style.setProperty('--pointer-y', `${pointer.y}px`);
    }

    /**
     * Set the style of the ripple.
     */
    setStyle()
    {
        for (let option of this.options) {

            // If the option is a number.
            if (isFinite(option)) {
                this.$rippleable.style.setProperty('--ripple-opacity', option);
            }

            // If the option is a duration.
            if (option.endsWith('ms') || option.endsWith('s')) {
                this.$rippleable.style.setProperty('--ripple-animation-duration', option);
            }
        }
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
}
