const DEFAULT_TIMEOUT = 10;

/**
 * Add a class to an HTML element temporarily.
 * @param {string} class_name The class to add.
 * @param {number|'transitionend'|'animationend'} [timeout]
 *  The duration after which the class is removed (in ms) – *Default: `10`*.
 *  The keywords `transitionend` or `animationend` can also be used to remove the class after a transition or animation.
 * @memberof Element
 */
Element.prototype.addClassTemporarily = function (class_name, timeout = DEFAULT_TIMEOUT)
{
    let $this = this;

    $this.classList.add(class_name);

    // Remove class after the transition or the animation ends.
    if (timeout === 'transitionend' || timeout === 'animationend') {
        $this.addEventListener(timeout, function () {
            this.classList.remove(class_name);
        }, { once: true });
    }
    // Remove class after the timeout ends.
    else {
        setTimeout(() => {
            $this.classList.remove(class_name);
        }, timeout);
    }
};
