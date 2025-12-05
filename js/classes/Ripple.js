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
 */

export default class Ripple {

    follow_pointer = new Boolean();

    /** @type {HTMLElement} The element to apply the ripple effect on. */
    $rippleable;

    /** @type {HTMLElement} The ripple effect. */
    $ripple;

    /**
     * @constructor Create and run the ripple effect.
     * @param {HTMLElement} $rippleable
     * @param {number} [client_x] The horizontal coordinate of the pointer within the viewport.
     * @param {number} [client_y] The vertical coordinate of the pointer within the viewport.
     */
    constructor($rippleable, client_x, client_y)
    {
        this.$rippleable = $rippleable;
        this.follow_pointer = this.$rippleable.dataset.ripple.includes('follow-pointer');

        // Create the ripple.
        this.$ripple = document.createElement('div');
        this.$ripple.className = 'ripple';
        this.$ripple.addEventListener('animationend', this.remove.bind(this));

        this.$rippleable.appendChild(this.$ripple);

        this.setStyle();

        if (client_x !== undefined && client_y !== undefined) {
            this.setPosition(client_x, client_y);
        }
    }

    /**
     * Set the position of the ripple (only with the `follow-pointer` option).
     * @param {number} client_x The horizontal coordinate of the pointer within the viewport.
     * @param {number} client_y The vertical coordinate of the pointer within the viewport.
     * @returns
     */
    setPosition(client_x, client_y)
    {
        if (!this.follow_pointer) return;

        const rippleable = this.$rippleable.getBoundingClientRect();

        // Define the ripple origin position, and clamp it inside the element if the pointer overflows.
        const pointer = {
            x: Math.clamp((client_x - rippleable.left), 0, rippleable.width),
            y: Math.clamp((client_y - rippleable.top), 0, rippleable.height)
        };

        this.$ripple.style.top = `${pointer.y}px`;
        this.$ripple.style.left = `${pointer.x}px`;
    }

    /**
     * Set the opacity and animation duration of the ripple.
     */
    setStyle()
    {
        const options = this.$rippleable.dataset.ripple.split(' ');

        for (const option of options) {

            // If the option is a number.
            if (isFinite(option)) {
                this.$ripple.style.opacity = option;
            }

            // If the option is a duration.
            if (option.endsWith('ms') || option.endsWith('s')) {
                this.$ripple.style.animationDuration = option;
            }
        }
    }

    /**
     * Remove the ripple from the DOM.
     */
    remove()
    {
        this.$ripple.remove();
    }
}
