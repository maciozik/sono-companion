const DURATION_DEFAULT = 10;

/**
 * Make the device vibrate depending on the user settings.
 * @param {...number} [pattern] The pattern of vibration, with alternation of vibration durations and pause durations (in ms). – *Default: {@link DURATION_DEFAULT}*
 * @memberof app
 */
app.vibrate = function (...pattern)
{
    if ('vibrate' in navigator && STG.allow_vibrations) {

        pattern = (pattern.length === 0) ? [DURATION_DEFAULT] : pattern;
        navigator.vibrate(pattern);

        console.debugType('vibrate', '', pattern.map(v => v + 'ms').join(' '));
    }
};
