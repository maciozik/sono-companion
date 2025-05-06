/**
 * Log a formatted debug message in the console.
 * @param {string} type 'emit_event' or 'create_key'.
 * @param {string} label
 * @param {any} value
 * @memberof console
 */
console.debugType = function (type, label, value)
{
    if (ENV.DEV_MODE) {

        let _blue_ = 'color: skyblue';
        let _purple_ = 'color: #87F';
        let _grey_ = 'color: lightslategrey';
        let __ = 'color: inherit';

        switch (type) {

            case 'emit_event':
                console.debug(
                    `%c(•)%c  The event %c${label}%c was emitted with the value:`,
                    _grey_, __, _blue_, __,
                    value
                );
                break;

            case 'create_key':
                console.debug(
                    `%c[↓]%c  The key %c${label}%c was created in the storage with the value:`,
                    _grey_, __, _blue_, __,
                    value
                );
                break;

            case 'vibrate':
                console.debug(
                    `%c⁞□⁞%c  Vibrations were triggered with the pattern: %c${value}`,
                    _grey_, __, _purple_
                );
                break;
        }
    }
};
