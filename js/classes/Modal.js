import * as History from '/js/core/history.js';

/**
 * Represents a modal.
 */
export default class Modal
{
    /** @type {string} @readonly */
    static PRIMARY_BTN_DEFAULT = "Valider";

    /** @type {string} @readonly */
    static SECONDARY_BTN_DEFAULT = "Annuler";

    /** @type {Function} @readonly */
    static CALLBACK_DEFAULT = () => Modal.close();

    /** @type {number} @readonly */
    static CLOSE_DELAY = 100;

    title = new String();
    text = new String();
    context = 'app';

    /** @type {string} */
    primary_btn = new String();
    /** @type {string|null} */
    secondary_btn = new String();

    /** @type {Function|null} */
    #primaryCallback = null;
    /** @type {Function|null} */
    #secondaryCallback = null;

    static #listenersAbort = new AbortController();

    static $overlay = document.getElementById('overlay');
    static $modal = Modal.$overlay.querySelector('.modal');
    static $modalTitle = Modal.$modal.querySelector('.modal-title');
    static $modalText = Modal.$modal.querySelector('.modal-text');
    static $modalBtnPrimary = Modal.$modal.querySelector('.modal-btn-primary');
    static $modalBtnSecondary = Modal.$modal.querySelector('.modal-btn-secondary');

    /**
     * @constructor
     * @param {string|null} [title] The title of the modal (no title if null).
     * @param {string} [text] The text of the modal.
     * @returns {Modal}
     */
    constructor (title = null, text = "")
    {
        this.title = title;
        this.text = text;
        Modal.#listenersAbort = new AbortController();
        return this;
    }

    /**
     * Set the text of the modal.
     * @param {string} text
     * @returns {Modal}
     */
    setText(text)
    {
        this.text = text;
        return this;
    }

    /**
     * Set the context of the modal.
     * @param {string} context `app` : the modal will be shown above the whole app *(default)*.
     *                         `view`: the modal will be shown above the current view only.
     * @returns {Modal}
     */
    setContext(context)
    {
        this.context = context;
        return this;
    }

    /**
     * Set the text and the callback of the primary button.
     * @param {string|undefined} [text] The text of the primary button. – *Default: {@link PRIMARY_BTN_DEFAULT}*
     * @param {Function} [callback] A callback if the primary button is selected. – *Default: {@link CALLBACK_DEFAULT}*
     * @returns {Modal}
     */
    setPrimaryBtn(text = Modal.PRIMARY_BTN_DEFAULT, callback = undefined)
    {
        this.primary_btn = text ?? Modal.PRIMARY_BTN_DEFAULT;
        this.#primaryCallback = (callback !== undefined) ? callback : Modal.CALLBACK_DEFAULT;

        // Bind the callback to the button.
        Modal.$modalBtnPrimary.addEventListener('trigger', this.#primaryCallback.bind(this), {
            signal: Modal.#listenersAbort.signal
        });

        return this;
    }

    /**
     * Set the text and the callback of the secondary button.
     * @param {string|undefined|null} [text] The text of the secondary button, or `null` to hide it. – *Default: {@link SECONDARY_BTN_DEFAULT}*
     * @param {Function} [callback] A callback to call when the secondary button is selected. – *Default: {@link CALLBACK_DEFAULT}*
     * @returns {Modal}
     */
    setSecondaryBtn(text = Modal.SECONDARY_BTN_DEFAULT, callback = undefined)
    {
        this.secondary_btn = text;

        if (text !== null) {

            this.#secondaryCallback = (callback !== undefined) ? callback : Modal.CALLBACK_DEFAULT;

            // Bind the callback to the button.
            Modal.$modalBtnSecondary.addEventListener('trigger', this.#secondaryCallback.bind(this), {
                signal: Modal.#listenersAbort.signal
            });
        }

        return this;
    }

    /**
     * Open the modal.
     * @returns {Promise.void} A promise returned when the opening animation is over.
     */
    open()
    {
        // Set the buttons if needed and not already defined.
        if (this.#primaryCallback === null) {
            this.setPrimaryBtn();
        }
        if (this.#secondaryCallback === null && this.secondary_btn !== null) {
            this.setSecondaryBtn();
        }

        // Fill the modal and set the context.
        Modal.$modalTitle.innerHTML = this.title;
        Modal.$modalText.innerHTML = this.text;
        Modal.$modalBtnPrimary.innerHTML = this.primary_btn;
        Modal.$modalBtnSecondary.innerHTML = this.secondary_btn;
        Modal.$overlay.dataset.context = this.context;

        // Remove the title and secondary button if null.
        Modal.$modalTitle.classList.toggle('hide', (this.title === null));
        Modal.$modalBtnSecondary.classList.toggle('hide', (this.secondary_btn === null));

        // Allow a tap outside the modal to close it.
        setTimeout(() => {
            Modal.$overlay.addEventListener('pointerup', (event) => {
                if (event.target === Modal.$overlay) {
                    Modal.close(50);
                }
            }, { signal: Modal.#listenersAbort.signal });
        }, 200); // Prevent accidental tap.

        // Reactivate the transitions and show the modal.
        Modal.$overlay.classList.remove('instant');
        Modal.$overlay.classList.add('active');

        // Create a state in the history.
        History.push('modal', () => {
            Modal.close();
        });

        // Return a promise when the opening animation is over.
        return new Promise((resolve) => {
            const whenOpened = () => {
                Modal.$modal.removeEventListener('transitionend', whenOpened);
                resolve();
            }
            Modal.$modal.addEventListener('transitionend', whenOpened, { once: true });
        });
    }

    /**
     * Hide the modal.
     * @param {number} [delay] The delay after which the modal is hidding (in ms). – *Default: {@link CLOSE_DELAY}*
     * @param {boolean} [instant] Whether the modal must close without transitions. – *Default: `false`*
     * @returns {Promise.void} A promise returned when the closing animation is over.
     */
    static close(delay = Modal.CLOSE_DELAY, instant = false)
    {
        // Unbind the callbacks from the buttons and the "tap outside" event.
        Modal.#listenersAbort.abort("Modal closed");

        // Deactivate the transitions if needed.
        Modal.$overlay.classList.toggle('instant', instant);

        // Hide the modal after the delay.
        setTimeout(() => {
            Modal.$overlay.classList.remove('active');
        }, delay);

        // Remove the state from the history.
        History.cancel('modal');

        // Return a promise when the closing animation is over.
        return new Promise((resolve) => {
            const whenClosed = () => {
                Modal.$modal.removeEventListener('transitionend', whenClosed);
                resolve();
            }
            Modal.$modal.addEventListener('transitionend', whenClosed, { once: true });
        });
    }
}
