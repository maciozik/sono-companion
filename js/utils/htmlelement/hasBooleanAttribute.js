/**
 * Check if a supposly boolean attribute is considered `true` or `false`.
 * @param {string} attr_name
 * @returns {boolean} False if the attribute is absent or set to `false`, true otherwise.
 * @memberof HTMLElement
 */
HTMLElement.prototype.hasBooleanAttribute = function (attr_name) {
    const value = this.getAttribute(attr_name);
    return (value !== null && value !== 'false');
}
