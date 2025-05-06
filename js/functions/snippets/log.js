/**
 * Log in the console.
 * @param {...any} data
 * @memberof window
 */
window.log = function (...data)
{
    if (ENV.DEV_MODE) {
        console.log(...data);
    }
};
