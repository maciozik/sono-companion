/**
 * Round a float value to a specific number of decimals.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 * @memberof Math
 */
Math.roundFloat = function (value, decimals)
{
    const precision = Math.pow(10, decimals);
    return Math.round(value * precision) / precision;
};

/**
 * Round up a float value to a specific number of decimals.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 * @memberof Math
 */
Math.ceilFloat = function (value, decimals)
{
   const precision = Math.pow(10, decimals);
   return Math.ceil(value * precision) / precision;
};

/**
 * Round down a float value to a specific number of decimals.
 * @param {number} value
 * @param {number} decimals
 * @returns {number}
 * @memberof Math
 */
Math.floorFloat = function (value, decimals)
{
    const precision = Math.pow(10, decimals);
    return Math.floor(value * precision) / precision;
};
