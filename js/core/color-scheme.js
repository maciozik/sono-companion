const DARK_KEYWORD = 'dark';
const LIGHT_KEYWORD = 'light';

const DARK_MEDIA_QUERY = window.matchMedia('(prefers-color-scheme: dark)');

const SETTING_COLOR_SCHEME = () => JSON.parse(localStorage.getItem('setting.app.color_scheme'));

/**
 * Set the color scheme of the app.
 * @param {'device'|'dark'|'light'|null} [color_scheme] *Default: the value in the settings.*
 */
function setColorScheme(color_scheme = SETTING_COLOR_SCHEME()) {

    // If the color scheme is neither `dark` nor `light` (`device` or not defined),
    // choose the color scheme of the device.
    if (!([DARK_KEYWORD, LIGHT_KEYWORD].includes(color_scheme))) {
        color_scheme = (DARK_MEDIA_QUERY.matches) ? DARK_KEYWORD : LIGHT_KEYWORD;
    }

    document.documentElement.dataset.colorScheme = color_scheme;

    if (!SETTING_COLOR_SCHEME()) {
        console.warn("The user's color scheme preference was not found.");
    }
}

setColorScheme();

// Check the color scheme if the color scheme of the device changes.
DARK_MEDIA_QUERY.addEventListener('change', event => {
    setColorScheme();
});

// Check the color scheme or set the high contrast mode if the settings change.
import('../views/settings.js').then(Settings => {

    Settings.onchange(['color_scheme'], event => {
        setColorScheme(event.detail.value);
    });

    Settings.onsync(['high_contrast'], event => {
        document.documentElement.toggleAttribute('data-high-contrast', event.detail.value);
    });
});
