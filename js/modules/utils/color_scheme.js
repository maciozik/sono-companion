const DARK_KEYWORD = 'dark';
const LIGHT_KEYWORD = 'light';

const DARK_MEDIA_QUERY = window.matchMedia('(prefers-color-scheme: dark)');

const SETTING_COLOR_SCHEME = () => JSON.parse(localStorage.getItem('setting.app.color_scheme'));

/**
 * Set the color scheme of the app.
 * @param {'system'|'dark'|'light'|null} [color_scheme] *Default: the value in the settings.*
 */
function setColorScheme(color_scheme = SETTING_COLOR_SCHEME()) {

    // If the color scheme is neither 'dark' nor 'light' ('system' or not defined),
    // choose the color scheme of the system.
    if (!([DARK_KEYWORD, LIGHT_KEYWORD].includes(color_scheme))) {
        color_scheme = (DARK_MEDIA_QUERY.matches) ? DARK_KEYWORD : LIGHT_KEYWORD;
    }

    document.documentElement.dataset.colorScheme = color_scheme;

    if (!SETTING_COLOR_SCHEME()) {
        console.warn("The user's color scheme preference was not found.");
    }
}

setColorScheme();

// Check the color scheme if the color scheme of the system changes.
DARK_MEDIA_QUERY.addEventListener('change', event => {
    setColorScheme();
});

// Check the color scheme if the setting changes.
import('../settings.js').then(Settings => {
    Settings.onchange(['color_scheme'], event => {
        setColorScheme(event.detail.value);
    });
});
