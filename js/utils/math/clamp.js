/**
 * Clamp a value between a minimum and a maximum.
 * @param {number} value
 * @param {number} min
 * @param {number} max
 * @returns {number}
 * @memberof Math
 */
Math.clamp = function (value, min, max)
{
    return Math.min(Math.max(value, min), max);
};
