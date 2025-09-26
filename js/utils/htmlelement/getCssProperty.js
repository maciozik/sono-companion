/**
 * Get the value of a CSS property or variable.
 *  - If the value starts with a number, it returns the number value.
 *  - If the unit of the value is `s`, it returns the number value after converting in ms.
 * @param {string} property
 * @returns {string|number}
 * @memberof HTMLElement
 */
HTMLElement.prototype.getCssProperty = function (property)
{
    let value = window.getComputedStyle(this).getPropertyValue(property);

    // If the value is in second.
    if (/\d(s)$/.test(value)) {
        return parseFloat(value) * 1000;
    }

    // Convert the value into number if it is possible.
    return parseFloat(value) || value;
};
