import * as View from '/js/views/view.js';
import * as Settings from '/js/views/settings.js';

export const $nav = document.querySelector('nav');
export const $tabs = $nav.querySelectorAll('.nav-tab');
export const $activeTabIndicator = $nav.querySelector('.active-tab-indicator');

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
    $tab.classList.toggle('hidden', !is_visible);

    // Stop the view if the tab must be hide.
    if (is_visible && View.isRun(view_id)) {
        View.stop(view_id);
    }

    // Display a message if no tab is visible.
    $nav.querySelector('p.no-tab').classList.toggle('show', (countVisible() === 0));
}

/**
 * Get the number of visible tabs.
 * @returns {number}
 */
function countVisible()
{
    return $nav.querySelectorAll('.nav-tab:not(.hidden)').length;
}

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    // Listen the settings to toggle the visibility of the tabs if necessary.
    for (const $tab of $tabs) {
        const view_id = $tab.dataset.load;
        const event_type = `enable_${view_id}`;

        Settings.onsync(event_type, event => {
            setTabVisibility(view_id, event.detail.value);
        });
    };

    // Move the active tab indicator when a view is loaded.
    View.$main.addEventListener('load', event => {
        const $tab = getTabFromViewId(event.detail.$view.id);
        $activeTabIndicator.classList.toggle('show', ($tab !== null));

        // If the view loaded is linked to a nav tab.
        if ($tab !== null) {
            $activeTabIndicator.style.translate = $tab.offsetLeft + 'px 0';
            $activeTabIndicator.style.width = $tab.offsetWidth + 'px';
            $activeTabIndicator.addClassTemporarily('move', 'animationend');
        }
    });

    // Run the tab if its view is running.
    View.$main.addEventListener('run', event => {
        const $tab = getTabFromViewId(event.detail.view_id);
        $tab.classList.add('run');
    });

    // Stop the tab if the view is paused or stopped.
    ['pause', 'stop'].forEach(event_type => {
        View.$main.addEventListener(event_type, event => {
            const $tab = getTabFromViewId(event.detail.view_id);
            $tab.classList.remove('run');
        });
    });
}
