/**
 * Perform a double `requestAnimationFrame()`.
 * @param {Function} callback
 * @memberof window
 */
window.doubleRequestAnimationFrame = function (callback)
{
    requestAnimationFrame(() => {
        requestAnimationFrame(callback);
    });
};
