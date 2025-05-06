/**
 * Get the float part of a number.
 * @param {number|string} number
 * @param {number} [decimals] Number of decimals to get from the float part. – *Default: `Infinity`*
 * @returns {string}
 * @memberof Math
 */
Math.float = function (number, decimals = Infinity)
{
    let float = number.toString().split('.')[1] || "0";
    float = float.substring(0, decimals);

    return float;
};
