const TIMEOUT_DEFAULT = 10;

/**
 * Add a class to an HTML element temporarily.
 * @param {string} class_name The class to add.
 * @param {number|'transitionend'|'animationend'} [timeout]
 *  The duration after which the class is removed (in ms). – *Default: {@link TIMEOUT_DEFAULT}*.
 *  The keywords `transitionend` or `animationend` can also be used to remove the class after a transition or animation.
 * @returns {{ cancel: Function }} An object with a `cancel` method to abort the removal of the class.
 * @memberof HTMLElement
 */
HTMLElement.prototype.addClassTemporarily = function (class_name, timeout = TIMEOUT_DEFAULT)
{
    const _this = this;

    /** @type {Function} */
    let cancel;

    _this.classList.add(class_name);

    // Remove class after the transition or the animation ends.
    if (timeout === 'transitionend' || timeout === 'animationend') {
        cancel = bindEvent(_this, class_name, timeout);
    }
    // Remove class after the timeout ends.
    else {
        cancel = runTimeout(_this, class_name, timeout);
    }

    return { cancel: cancel };
};

/**
 * Bind the listerner to remove the class after the transition or animation.
 * @param {HTMLElement} $element
 * @param {string} class_name
 * @param {'transitionend'|'animationend'} event_type
 * @returns {Function} The function to call to unbind the listener.
 */
function bindEvent($element, class_name, event_type)
{
    const classRemovalAbort = new AbortController();

    $element.addEventListener(
        event_type,
        function (event) {
            this.classList.remove(class_name);
            event.stopPropagation();
        },
        {
            once: true,
            signal: classRemovalAbort.signal
        }
    );

    const cancel = () => classRemovalAbort.abort();
    return cancel;
}

/**
 * Run a timeout before removing the class.
 * @param {HTMLElement} $element
 * @param {string} class_name
 * @param {number} timeout
 * @returns {Function} The function to call to cancel the timeout.
 */
function runTimeout($element, class_name, timeout)
{
    const classRemovalTimeout = setTimeout(() => {
        $element.classList.remove(class_name);
    }, timeout);

    const cancel = () => clearTimeout(classRemovalTimeout);
    return cancel;
}
