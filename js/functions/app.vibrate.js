import * as Settings from '../modules/settings.js';

const ALLOW_VIBRATIONS = () => Settings.get('allow_vibrations');
const DEFAULT_DURATION = 10;

if ('app' in window === false) {
    window.app = new Object;
}

/**
 * Make the device vibrate depending on the user settings.
 * @param {...number} [pattern] The pattern of vibration, with alternation of vibration durations and pause durations (in ms). – *Default: `DEFAULT_DURATION`*
 * @memberof app
 */
app.vibrate = function (...pattern)
{
    if ('vibrate' in navigator && ALLOW_VIBRATIONS()) {

        pattern = (pattern.length === 0) ? [DEFAULT_DURATION] : pattern;
        navigator.vibrate(pattern);

        console.debugType('vibrate', '', pattern.map(v => v + 'ms').join(' '));
    }
}
