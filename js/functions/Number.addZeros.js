/**
 * Add leading zeros to a number.
 * @param {number} digits Number of digits the chosen part of the number must contains.
 * @param {string} [position] The position to add the zeros. – *Default: `leading`*
 *                            - `leading`: Add zeros before the integral part.
 *                            - `trailing`: Add zeros after the float part.
 * @returns {string}
 * @memberof Number
 */
Number.prototype.addZeros = function (digits, position = 'leading')
{
    if (digits <= 0) return this.toString();

    let sign = (Math.sign(this) === -1) ? '-' : '';
    let [integral, float] = Math.abs(this).toString().split('.');

    switch (position) {
        case 'leading': integral = integral.padStart(digits, "0"); break;
        case 'trailing': float = (float || "0").padEnd(digits, "0"); break;
    }

    float = ((float !== undefined) ? ('.' + float) : '')

    return sign + integral + float;
};
