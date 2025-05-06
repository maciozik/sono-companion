/**
 * Represents a modal.
 */
export default class Modal
{
    /** @type {string} @readonly */
    static PRIMARY_BTN_DEFAULT = "Accepter";

    /** @type {string} @readonly */
    static SECONDARY_BTN_DEFAULT = "Refuser";

    /** @type {number} @readonly */
    static CLOSE_DELAY = 100;

    title = new String();
    text = new String();
    context = 'app';
    disallow_click_outside = false;

    /** @type {string} */
    primary_btn = Modal.PRIMARY_BTN_DEFAULT;
    /** @type {string|null} */
    secondary_btn = Modal.SECONDARY_BTN_DEFAULT;

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
     * @param {string} [title] The title of the modal.
     * @param {string} [text] The text of the modal.
     * @returns {Modal}
     */
    constructor (title = "", text = "")
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
     * @param {string} context 'app' : the modal will be shown above the whole app.
     *                         'view': the modal will be shown above the current view only.
     * @returns {Modal}
     */
    setContext(context)
    {
        this.context = context;
        return this;
    }

    /**
     * Set the text and the callback of the primary button.
     * @param {string|''} text The text of the primary button. – *If empty: `Modal.PRIMARY_BTN_DEFAULT`.*
     * @param {Function} [callback] A callback if the primary button is selected. – *Default: close the modal.*
     * @returns {Modal}
     */
    setPrimaryBtn(text, callback = undefined)
    {
        const default_callback = () => Modal.close();

        this.primary_btn = (text !== '') ? text : this.primary_btn;
        this.#primaryCallback = (callback !== undefined) ? callback : default_callback;

        // Bind the callback to the button.
        Modal.$modalBtnPrimary.addEventListener('click', this.#primaryCallback.bind(this), {
            signal: Modal.#listenersAbort.signal
        });

        return this;
    }

    /**
     * Set the text and the callback of the secondary button.
     * @param {string|''|null} text The text of the secondary button, or null to hide it. – *If empty: `Modal.SECONDARY_BTN_DEFAULT`.*
     * @param {Function} [callback] A callback to call when the secondary button is selected. – *Default: close the modal.*
     * @returns {Modal}
     */
    setSecondaryBtn(text, callback = undefined)
    {
        const default_callback = () => Modal.close();

        this.secondary_btn = (text !== '') ? text : this.secondary_btn;
        this.#secondaryCallback = (callback !== undefined) ? callback : default_callback;

        // Bind the callback to the button.
        Modal.$modalBtnSecondary.addEventListener('click', this.#secondaryCallback.bind(this), {
            signal: Modal.#listenersAbort.signal
        });

        return this;
    }

    /**
     * Do not close the modal when clicking outside of it.
     * @param {boolean} [disallow_click_outside] *Default: `true`*
     * @returns {Modal}
     */
    disallowClickOutside(disallow_click_outside = true)
    {
        this.disallow_click_outside = disallow_click_outside;
        return this;
    }

    /**
     * Open the modal.
     * @returns {Promise.void} A promise returned when the opening animation is over.
     */
    open()
    {
        // Fill the modal.
        Modal.$modalTitle.innerHTML = this.title;
        Modal.$modalText.innerHTML = this.text;
        Modal.$modalBtnPrimary.innerHTML = this.primary_btn;

        // Show or remove the title as needed.
        if (this.title === "") {
            Modal.$modalTitle.classList.add('hide');
        } else {
            Modal.$modalTitle.classList.remove('hide');
        }

        // Set the context.
        Modal.$overlay.dataset.context = this.context;

        // Set the buttons if not already defined.
        if (this.#primaryCallback === null) {
            this.setPrimaryBtn(Modal.PRIMARY_BTN_DEFAULT);
        }
        if (this.#secondaryCallback === null) {
            this.setSecondaryBtn(Modal.SECONDARY_BTN_DEFAULT);
        }

        // Remove the secondary button if null.
        if (this.secondary_btn !== null) {
            Modal.$modalBtnSecondary.innerHTML = this.secondary_btn;
            Modal.$modalBtnSecondary.classList.remove('hide');
        } else {
            Modal.$modalBtnSecondary.classList.add('hide');
        }

        // Allow a click outside the modal to close it.
        if (!this.disallow_click_outside) {
            setTimeout(() => {
                Modal.$overlay.addEventListener('pointerup', (event) => {
                    if (event.target === Modal.$overlay) {
                        Modal.close(50);
                    }
                }, { signal: Modal.#listenersAbort.signal });
            }, 200); // Prevent accidental tap.
        }

        // Reactivate the transitions.
        Modal.$overlay.classList.remove('instant');

        // Show the modal.
        Modal.$overlay.classList.add('active');

        // Return a promise when the opening animation is over.
        return new Promise((resolve) => {
            const whenOpened = () => {
                Modal.$modal.removeEventListener('transitionend', whenOpened);
                resolve();
            }
            Modal.$modal.addEventListener('transitionend', whenOpened);
        });
    }

    /**
     * Hide the modal.
     * @param {number} [delay] The delay after which the modal is hidding (in ms). – *Default: `Modal.CLOSE_DELAY`*
     * @param {boolean} [instant] Whether or not the modal must close without transitions. – *Default: `false`*
     * @returns {Promise.void} A promise returned when the closing animation is over.
     */
    static close(delay = Modal.CLOSE_DELAY, instant = false)
    {
        // Unbind the callbacks from the buttons and the click outside event.
        Modal.#listenersAbort.abort("Modal closed");

        // Deactivate the transitions if needed.
        Modal.$overlay.classList.toggle('instant', instant);

        // Hide the modal after the delay.
        setTimeout(() => {
            Modal.$overlay.classList.remove('active');
        }, delay);

        // Return a promise when the closing animation is over.
        return new Promise((resolve) => {
            const whenClosed = () => {
                Modal.$modal.removeEventListener('transitionend', whenClosed);
                resolve();
            }
            Modal.$modal.addEventListener('transitionend', whenClosed);
        });
    }
}
