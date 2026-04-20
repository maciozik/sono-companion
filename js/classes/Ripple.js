import { removePersistRipple } from '/js/components/rippleable.js';

/**
 * Represents a ripple effect on a rippleable element.
 *
 * @description
 * A ripple effect is a growing circle animation that can be run in the background of an element.
 * It is defined by the presence of the `data-ripple` attribute, and often follows an interaction with the element.
 *
 * Several options may be defined as values of this `data-ripple` attribute, separated by spaces:
 *  - `fill`             : The ripple effect will fill the entire rippleable element, instead of being width-limited.
 *  - `persist`          : The ripple effect will not disappear after its animation. Following ripples will still
 *                         behave normally as long as there is a persistent ripple present.
 *     - A {@link removePersistRipple} function is accessible on the rippleable element to remove the persistent ripple.
 *  - `follow-pointer`   : The ripple effect is run at the position of the user interaction, instead of at its center.
 *  - **Any raw number** : The opacity of the circle (e.g. `0.2`).
 *  - **Any duration**   : The animation duration of the circle (in ms or s).
 */

export default class Ripple {

    fill           = new Boolean();
    persist        = new Boolean();
    follow_pointer = new Boolean();

    /** @type {{ x: number, y: number }} The position of the pointer relative to the rippleable element if it exists. */
    pointer = {
        x: 0,
        y: 0
    };

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

        this.fill           = this.$rippleable.dataset.ripple.includes('fill');
        this.persist        = this.$rippleable.dataset.ripple.includes('persist');
        this.follow_pointer = this.$rippleable.dataset.ripple.includes('follow-pointer');

        const is_persist_ripple_present = $rippleable.querySelector('.ripple.persist') !== null;

        // Create the ripple.
        this.$ripple = document.createElement('div');
        this.$ripple.className = 'ripple';

        // Define the position of the ripple if it must follow the pointer.
        if (this.follow_pointer && client_x !== undefined && client_y !== undefined) {
            this.setPosition(client_x, client_y);
        }

        this.setWidth();

        // Choose the way to handle the end of the animation (normal or persistent).
        if (!this.persist || is_persist_ripple_present) {
            this.$ripple.addEventListener('animationend', this.remove.bind(this));
        } else {
            this.setAsPersistent();
        }

        this.$rippleable.appendChild(this.$ripple);
        this.setStyle();
    }

    /**
     * Set the position of the ripple.
     * @param {number} client_x The horizontal coordinate of the pointer within the viewport.
     * @param {number} client_y The vertical coordinate of the pointer within the viewport.
     */
    setPosition(client_x, client_y)
    {
        const rippleable = this.$rippleable.getBoundingClientRect();

        // Define the ripple origin position, and clamp it inside the element if the pointer overflows.
        this.pointer = {
            x: Math.clamp((client_x - rippleable.left), 0, rippleable.width),
            y: Math.clamp((client_y - rippleable.top), 0, rippleable.height)
        };

        this.$ripple.style.top = `${this.pointer.y}px`;
        this.$ripple.style.left = `${this.pointer.x}px`;
    }

    /**
     * Set the width of the ripple.
     */
    setWidth()
    {
        const rippleable = this.$rippleable.getBoundingClientRect();
        let ripple_width = rippleable.width;

        if (this.fill) {

            // Set the width as the distance from the pointer to the most distant corner of the rippleable element.
            if (this.follow_pointer) {
                ripple_width = 2 * Math.hypot(
                    Math.max(this.pointer.x, rippleable.width - this.pointer.x),
                    Math.max(this.pointer.y, rippleable.height - this.pointer.y)
                );
            }
            // Set the width as the diagonal of the rippleable element.
            else {
                ripple_width = Math.hypot(rippleable.width, rippleable.height);
            }
        }

        this.$ripple.style.setProperty('--ripple-width', ripple_width + 'px');
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
     * Define the ripple behavior when set as persistent.
     */
    setAsPersistent()
    {
        this.$ripple.classList.add('persist');

        // Bind the event to remove the persistent ripple when `removePersistRipple` is called on the rippleable element.
        this.$ripple.addEventListener('transitionend', this.remove.bind(this));
    }

    /**
     * Remove the ripple from the DOM.
     */
    remove()
    {
        this.$ripple.remove();
    }
}
