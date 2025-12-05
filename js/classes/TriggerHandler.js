import Ripple from '/js/classes/Ripple.js';

/**
 * Handles the interaction with a triggerable element.
 *
 * @description
 * A triggerable is an interactive element that emits a `trigger` event when interected with.
 * It is defined by the presence of the `data-trigger` attribute.
 *
 * Several options may be defined as values of this `data-trigger` attribute, separated by spaces:
 *  - `click`       : Trigger the element on click event *(default)*.
 *  - `pointerdown` : Trigger the element on pointerdown event.
 *  - `pointerup`   : Trigger the element on pointerup event.
 *  - `manually`    : The element will not be triggered by any interaction and must be triggered manually.
 *     - The {@link trigger} method is accessible via the `_TriggerHandler` instance bind to the triggerable element.
 *  - `depress`     : The element will depress briefly when triggered.
 *
 * Moreover, the following classes can change the behavior of the element:
 *  - `disabled`       : The element will not be triggered at all.
 *  - `cancel-trigger` : If applied to a child element, any action targeting that element or its descendants
 *                       will no longer trigger the triggerable element.
 *
 * A triggerable element can also run a ripple effect on itself when triggered.
 * @see {@link Ripple} for available options of the `data-ripple` attribute.
 */

export default class TriggerHandler {

    event_type = new String();
    options = new Array();

    /** @type {HTMLElement & { _TriggerHandler: TriggerHandler }} The interactive element. */
    $triggerable;

    /**
     * @constructor
     * @param {HTMLElement} $triggerable
     */
    constructor($triggerable)
    {
        this.$triggerable = $triggerable;
        this.options = this.$triggerable.dataset.trigger.split(' ');

        this.setEventType();
        this.bindEvents();

        // Bind this instance to the DOM element.
        this.$triggerable._TriggerHandler = this;
    }

    /**
     * Trigger the triggerable element by emitting the `trigger` event.
     *
     * Can be called from outside (necessary with the `manually` option):
     * ```js
     * $triggerable._TriggerHandler.trigger(event);
     * ```
     *
     * @param {Event} [event] The event that triggered the triggerable element.
     * @fires `trigger` on $triggerable.
     */
    trigger(event)
    {
        if (this.has('depress')) {
            this.$triggerable.addClassTemporarily('depress', 150);
        }

        // Emit the `trigger` event.
        this.$triggerable.dispatchEvent(new CustomEvent('trigger', { detail: {
            event_source: event ?? undefined
        }}));
    }

    /**
     * Set the type of event to bind to the triggerable element.
     */
    setEventType()
    {
        if (this.has('pointerdown')) {
            this.event_type = 'pointerdown';
        }
        else if (this.has('pointerup')) {
            this.event_type = 'pointerup';
        }
        else {
            this.event_type = 'click';
        }
    }

    /**
     * Whether the triggerable element has an option.
     * @param {string} option
     * @returns {boolean}
     */
    has(option)
    {
        return this.options.includes(option);
    }

    /**
     * Bind events to the triggerable element.
     */
    bindEvents()
    {
        // Trigger the triggerable element when the correct event occurs.
        this.$triggerable.addEventListener(this.event_type, (event) => {

            // If it must not be triggered manually, and if no `cancel-trigger` element exists.
            if (!this.has('manually') && event.target.closest('.cancel-trigger') === null) {
                this.trigger(event);
            }

            event.preventDefault();
            event.stopPropagation();
        });
    }
}
