/**
 * Get the value of a CSS property or variable.
 * @param {string} property
 * @param {boolean} [as_number] Returns the value as a number if possible. – *Default: `true`*
 *  If the unit of the value is `s`, it returns the number value after converting in ms.
 * @returns {string|number}
 * @memberof HTMLElement
 */
HTMLElement.prototype.getCssProperty = function (property, as_number = true)
{
    let value = window.getComputedStyle(this).getPropertyValue(property);

    if (as_number) {

        // If the value is in second.
        if (/^\d+(s)$/.test(value)) {
            return parseFloat(value) * 1000;
        }

        // Convert the value into number if possible.
        return parseFloat(value) || value;
    }

    return value;
};
