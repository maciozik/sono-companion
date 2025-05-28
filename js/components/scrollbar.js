import * as View from '../views/view.js';
import * as Settings from '../views/settings.js';

const $scrollbar = document.getElementById('scrollbar');
const $scrollbarThumb = $scrollbar.querySelector('.scrollbar-thumb');
const $views = document.getElementsByClassName('view');

/**
 * Update the size and visibility of the scrollbar.
 * @param {string} view_id The id of the view to check if the scrollbar is needed on.
 */
export function update(view_id)
{
    const $view = document.getElementById(view_id);
    let view_content_height = $view.scrollHeight;
    let view_height = $view.clientHeight;

    // If the content of the view overflows.
    if (view_content_height > view_height) {

        $scrollbar.classList.remove('hide');

        let scroll = $view.scrollTop;
        let scrollbar_height = $scrollbar.offsetHeight;
        let scrollbar_thumb_height = $scrollbarThumb.offsetHeight;

        let scrollbar_y = ((scrollbar_height - scrollbar_thumb_height)) * scroll / (view_content_height - view_height);

        $scrollbarThumb.style.transform = `translateY(${scrollbar_y}px)`;

    }
    else {
        $scrollbar.classList.add('hide');
    }
}

// Update the scrollbar if a new view is loaded.
document.addEventListener('load', event => { update(event.detail.view_id); });

// Update the scrollbar if the window is resized.
window.addEventListener('resize', () => { update(View.getCurrent().id); });

// Update the scrollbar if a view is scrolled.
for (const $view of $views) {
    $view.addEventListener('scroll', () => { update($view.id); });
}
