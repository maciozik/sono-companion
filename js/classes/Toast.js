/**
 * Represents a toast.
 */
export default class Toast
{
    /** @type {number} @readonly */
    static DURATION_DEFAULT = 3000;

    text = new String();
    duration = new Number();
    delay = new Number();

    /** @type {number} */
    static toastTimeout;

    static $toast = document.getElementById('toast');

    /**
     * @constructor
     * @param {string} [text] The text of the toast.
     * @param {number} [duration] The duration of the toast.
     */
    constructor (text = "", duration = Toast.DURATION_DEFAULT)
    {
        this.text = text;
        this.duration = duration;
    }

    /**
     * Set the text of the toast.
     * @param {string} text
     * @returns {Toast}
     */
    setText(text)
    {
        this.text = text;
        return this;
    }

    /**
     * Set the duration of the toast.
     * @param {number} duration The duration (in ms).
     * @returns {Toast}
     */
    setDuration(duration)
    {
        this.duration = duration;
        return this;
    }

    /**
     * Set the delay used before showing the toast.
     * @param {number} delay The duration of the delay (in ms).
     * @returns {Toast}
     */
    setDelay(delay)
    {
        this.delay = delay;
        return this;
    }

    /**
     * Show the toast.
     */
    show()
    {
        let duration = this.duration * STG.toast_duration;

        setTimeout(() => {

            Toast.$toast.innerHTML = this.text;

            // Cancel the timeout.
            Toast.toastTimeout?.cancel();

            // Reactivate the transition and show the toast.
            Toast.$toast.classList.remove('instant');
            Toast.toastTimeout = Toast.$toast.addClassTemporarily('show', duration);

        }, this.delay);
    }

    /**
     * Hide the toast.
     * @param {boolean} [instant] Whether the toast must hide without transition. – *Default: `false`*
     */
    static hide(instant = false)
    {
        // Cancel the timeout.
        Toast.toastTimeout?.cancel();

        // Deactivate the transition if needed and hide the toast.
        Toast.$toast.classList.toggle('instant', instant);
        Toast.$toast.classList.remove('show');
    }
}
