/**
 * Log a formatted debug message in the console.
 * @param {'emit_event'|'vibrate'|'create_key'|
 *         'history:push'|'history:popstate'|'history:cancel'|
 *         'wakelock'
 *        } type
 * @param {string} label
 * @param {any} value
 * @memberof console
 */
console.debugType = function (type, label, value)
{
    let _blue_ = 'color: skyblue';
    let _purple_ = 'color: #87F';
    let _grey_ = 'color: lightslategrey';
    let __ = 'color: inherit';

    switch (type) {

        case 'emit_event':
            console.debug(
                `🔔 The event %c${label}%c was emitted with the value:`,
                _blue_, __,
                value
            );
            break;

        case 'vibrate':
            console.debug(
                `📳 Vibrations were triggered with the pattern: %c${value}`,
                _purple_
            );
            break;

        case 'create_key':
            console.debug(
                `⚙️ The key %c${label}%c was created in the storage with the value:`,
                _blue_, __,
                value
            );
            break;

        case 'history:push':
            console.debug(
                `⏩ State %c${label}%c pushed in history.`,
                _blue_, __
            );
            break;

        case 'history:popstate':
            console.debug(
                `⏪ Back button triggered from state %c${label}%c.`,
                _blue_, __
            );
            break;

        case 'history:cancel':
            console.debug(
                `⏹️ State %c${label}%c cancelled manually.`,
                _blue_, __
            );
            break;

        case 'wakelock':
            console.debug(
                `☀️ Wake Lock %c${label}%c.`,
                _blue_, __
            );
            break;
    }
};
