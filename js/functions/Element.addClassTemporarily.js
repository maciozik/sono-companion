/**
 * Bind a class to an HTML element temporarily.
 * @param {string} class_name The class to bind.
 * @param {number} timeout The duration after which the class is unbind (in ms).
 * @memberof Element
 */
Element.prototype.addClassTemporarily = function (class_name, timeout)
{
    let $this = this;
    $this.classList.add(class_name);

    setTimeout(() => {
        $this.classList.remove(class_name);
    }, timeout);
};
