import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';

export const $nav = document.querySelector('nav');
export const $tabs = $nav.querySelectorAll('.nav-tab');

/**
 * Get the tab that loads a specific view.
 * @param {string} view_id
 * @returns {HTMLElement}
 */
export function getTabFromViewId(view_id)
{
    return $nav.querySelector(`.nav-tab[data-load=${view_id}]`);
}

/**
 * Set the label of the navigation tab of a view.
 * @param {string} label
 * @param {string} [view_id] *Default: current view.*
 */
export function updateLabel(label, view_id = View.getCurrent().id)
{
    const $tab = getTabFromViewId(view_id);
    $tab.querySelector('.tab-label').textContent = label;
}

/**
 * Set the visibility of a tab.
 * @param {string} view_id
 * @param {boolean} is_visible
 */
function setTabVisibility(view_id, is_visible)
{
    const $tab = getTabFromViewId(view_id);

    // Change the visibility of the tab.
    $tab.classList.toggle('hide', !is_visible);

    // Stop the view if the tab must be hide.
    if (is_visible && View.isRun(view_id)) {
        View.stop(view_id);
    }

    // Display a message if no tab is visible.
    let is_there_tab_visible = View.getFirstVisible() !== null;
    $nav.querySelector('p.no-tab').classList.toggle('show', !is_there_tab_visible);
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    // Listen the settings to toggle the visibility of the tabs if necessary.
    for (const $tab of $tabs) {
        let view_id = $tab.dataset.load;
        let event_type = `enable_${view_id}`;

        Settings.onsync(event_type, event => {
            setTabVisibility(view_id, event.detail.value);
        });
    };

    // Run the tab if the view is running.
    document.addEventListener('run', event => {
        const $tab = getTabFromViewId(event.detail.view_id);
        $tab.classList.add('run');
    });

    // Stop the tab if the view is paused or stopped.
    ['pause', 'stop'].forEach(event_type => {
        document.addEventListener(event_type, event => {
            const $tab = getTabFromViewId(event.detail.view_id);
            $tab.classList.remove('run');
        });
    });
}
