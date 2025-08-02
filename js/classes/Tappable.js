/**
 * Represents a tappable element.
 *
 * @description
 * A tappable is an interactive element that can trigger a growing circle animation when pressed.
 * It is defined by the presence of the 'data-tappable' attribute.
 *
 * Several options can be defined in this attribute, separated by white spaces:
 *  - `click`           : Trigger the element on click event *(default)*.
 *  - `pointerdown`     : Trigger the element on pointerdown event.
 *  - `pointerup`       : Trigger the element on pointerup event.
 *  - `trigger-manually`: The element will not be triggered by an event and must be triggered manually.
 *  - `follow-tap`      : The circle animation is triggered at the position of the tap.
 *  - `no-circle`       : The circle animation will not be shown.
 *  - {Any raw number}  : The opacity of the circle (e.g. 0.2).
 *  - {Any duration}    : The animation duration of the circle (e.g. 200ms, 1s).
 *
 * Moreover, the following classes can change the behavior of the element:
 *  - `disabled`        : The animation will not be triggered at all.
 *  - `cancel-tappable` : If present on a child element, any action targeting that element or their descendants
 *                        will no longer trigger the animation of the parent.
 */

export default class Tappable {

    options = new Array();
    event_type = new String();

    /** @type {HTMLElement & { _Tappable: Tappable }} */
    $tappable;

    /**
     * @constructor
     * @param {HTMLElement} $tappable
     */
    constructor($tappable)
    {
        this.$tappable = $tappable;

        this.init();
        this.bindEvents();

        // Bind this instance to the DOM element.
        this.$tappable._Tappable = this;
    }

    /**
     * Trigger the tappable element.
     *
     * Can be called from outside (necessary with the `trigger-manually` option):
     * ```js
     * $tappable._Tappable.trigger(event);
     * ```
     *
     * @param {Event} event The event that triggers the tappable element.
     * @fires `trigger` on $tappable.
     */
    trigger(event)
    {
        let tappable = this.$tappable.getBoundingClientRect();
        let pointer = new DOMPoint(
            event.clientX - tappable.left,
            event.clientY - tappable.top
        );

        // Run the circle animation.
        this.runCircleAnimation(pointer);

        // Emit the 'trigger' event.
        this.$tappable.dispatchEvent(new CustomEvent('trigger'));
    }

    /**
     * Set the position of the circle and run its animation.
     * @param {DOMPoint} pointer
     */
    runCircleAnimation(pointer)
    {
        let tappable = this.$tappable.getBoundingClientRect();

        // Define the circle position by clamping it inside the element if the pointer overflows.
        let origin = new DOMPoint(
            Math.clamp(pointer.x, 0, tappable.width),
            Math.clamp(pointer.y, 0, tappable.height)
        );

        // Set the circle position.
        this.$tappable.style.setProperty('--circle-x', `${origin.x}px`);
        this.$tappable.style.setProperty('--circle-y', `${origin.y}px`);
        this.$tappable.style.setProperty('--tappable-width', `${tappable.width}px`);
        this.$tappable.style.setProperty('--tappable-height', `${tappable.height}px`);

        // Run the animation.
        this.$tappable.addClassTemporarily('ontap', 'animationend');
    }

    /**
     * Whether the tappable element has an option.
     * @param {string} option
     * @returns {boolean}
     */
    has(option)
    {
        return this.options.includes(option);
    }

    /**
     * Initialize the tappable element.
     */
    init()
    {
        // Set the options.
        this.options = this.$tappable.dataset.tappable.split(' ');

        // Define the type of event.
        this.event_type = 'click';

        if (this.has('pointerdown')) {
            this.event_type = 'pointerdown';
        }
        else if (this.has('pointerup')) {
            this.event_type = 'pointerup';
        }

        // Set the style of the circle.
        for (let option of this.options) {

            // If the option is a number.
            if (isFinite(option)) {
                this.$tappable.style.setProperty('--circle-opacity', option);
            }

            // If the option is a duration.
            if (option.endsWith('ms') || option.endsWith('s')) {
                this.$tappable.style.setProperty('--circle-animation-duration', option);
            }
        }
    }

    /**
     * Bind events to the tappable element.
     */
    bindEvents()
    {
        // Trigger tappable element on the event, except if it must be triggered manually.
        this.$tappable.addEventListener(this.event_type, (event) => {

            // If it must not be triggered manually, and if no cancel-tappable element exists.
            if (!this.has('trigger-manually') && event.target.closest('.cancel-tappable') === null) {
                this.trigger(event);
            }

            event.preventDefault();
            event.stopPropagation();
        });
    }
}
