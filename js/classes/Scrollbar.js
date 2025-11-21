/**
 * Represents a scrollbar.
 *
 * A scrollbar is added and linked to any element with a `data-scrollable` attribute.
 * Methods are accessible via the `_Scrollbar` instance bind to the scrollable element.
 */
export default class Scrollbar
{
    /** @type {number} @readonly The top and bottom margin of the scrollbar. */
    static MARGIN_BLOCK = 5;

    /**
     * @type {number} @readonly
     * Exponential variable for the calculation of the size of the scrollbar thumb.
     * Higher value reduce the thumb faster as scrollable content height increases.
     */
    static THUMB_SIZE_INTERPOLATION_FACTOR = .8;

    /** @type {HTMLElement & { _Scrollbar: Scrollbar }} */
    $scrollable;

    $scrollbar;
    $scrollbarThumb;

    /** Position and sizes of the scrollable element. */
    scrollable;

    scrollbar_height;
    scrollbar_thumb_height;

    /**
     * @constructor
     * @param {HTMLElement} $scrollable The element linked to the scrollbar.
     */
    constructor ($scrollable)
    {
        this.$scrollable = $scrollable;

        this.scrollable = {
            x            : this.$scrollable.offsetLeft,
            y            : this.$scrollable.offsetTop,
            inner_width  : this.$scrollable.clientWidth,
            inner_height : this.$scrollable.clientHeight,
            full_width   : this.$scrollable.offsetWidth,
            full_height  : this.$scrollable.offsetHeight,
            border_top   : this.$scrollable.getCssProperty('border-top-width'),
            border_left  : this.$scrollable.getCssProperty('border-left-width')
        }

        // Bind this instance to the DOM scrollable element.
        this.$scrollable._Scrollbar = this;
    }

    /**
     * Create and position the scrollbar.
     */
    create()
    {
        /** @type {DocumentFragment} */
        const $scrollbarTemplate = document.getElementById('scrollbar-template').content;
        /** @type {HTMLElement} */
        const $scrollbar = $scrollbarTemplate.cloneNode(true).querySelector('.scrollbar');

        this.$scrollbar = $scrollbar;
        this.$scrollbarThumb = $scrollbar.querySelector('.scrollbar-thumb');

        this.$scrollable.after(this.$scrollbar);

        this.setPosition();
        this.setHeight();
        this.update();
    }

    /**
     * Set the position of the scrollbar in the parent.
     */
    setPosition()
    {
        let scrollbar_right = this.$scrollable.offsetParent.clientWidth - this.scrollable.x - this.scrollable.full_width + this.scrollable.border_left;
        let scrollbar_top = this.scrollable.y + this.scrollable.border_top + Scrollbar.MARGIN_BLOCK;

        this.$scrollbar.style.top = `${scrollbar_top}px`;
        this.$scrollbar.style.right = `${scrollbar_right}px`;
    }

    /**
     * Set the height of the scrollbar.
     */
    setHeight()
    {
        // Get the height of the scrollable element again.
        this.scrollable.inner_height = this.$scrollable.clientHeight;

        this.scrollbar_height = this.scrollable.inner_height - (Scrollbar.MARGIN_BLOCK * 2);
        this.$scrollbar.style.height = `${this.scrollbar_height}px`;
    }

    /**
     * Update the visibility of the scrollbar, and the position and size of the scrollbar thumb.
     */
    update()
    {
        // Show the scrollbar if the content overflows the height.
        let is_visible = (this.getContentHeight() > this.scrollable.inner_height);
        this.setVisibility(is_visible);

        this.setThumbSize();
        this.moveThumb();
    }

    /**
     * Update the size and visibility of the scrollbar.
     */
    // TODO Allow drag and move on the thumb directly?
    moveThumb()
    {
        let scroll_ratio = this.getContentScroll() / (this.getContentHeight() - this.scrollable.inner_height);
        let scrollbar_thumb_y = (this.scrollbar_height - this.scrollbar_thumb_height) * scroll_ratio;

        if (!isFinite(scrollbar_thumb_y)) return;

        this.$scrollbarThumb.style.transform = `translateY(${scrollbar_thumb_y}px)`;
    }

    /**
     * Update the height of the scrollbar thumb.
     */
    setThumbSize()
    {
        let ratio = Math.pow(this.scrollable.inner_height / this.getContentHeight(), Scrollbar.THUMB_SIZE_INTERPOLATION_FACTOR);
        let scrollbar_thumb_height = this.scrollbar_height * ratio;

        if (!isFinite(scrollbar_thumb_height)) return;

        this.scrollbar_thumb_height = scrollbar_thumb_height;
        this.$scrollbarThumb.style.height = `${this.scrollbar_thumb_height}px`;
    }

    /**
     * Get the current scroll in the scrollable element.
     * @returns {number}
     */
    getContentScroll()
    {
        return this.$scrollable.scrollTop
    }

    /**
     * Get the full height of the scrollable content.
     * @returns {number}
     */
    getContentHeight()
    {
        return this.$scrollable.scrollHeight;
    }

    /**
     * Set the visibility of the scrollbar.
     * @param {boolean} is_visible
     */
    setVisibility(is_visible)
    {
        this.$scrollbar.classList.toggle('show', is_visible);
    }
}
