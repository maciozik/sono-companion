export default class GIcon extends HTMLElement
{
    /** @type {string} @readonly */
    static _THEME_DEFAULT = 'round';

    name = new String();
    theme = new String();
    x = new Number();
    y = new Number();

    constructor ()
    {
        super();
    }

    /**
     * When the element is connected to the DOM.
     */
    connectedCallback()
    {
        // Set the name.
        this.name = this.dataset.name;
        this.textContent = this.name;

        // Set the theme.
        switch (this.dataset.theme) {
            case undefined: this.theme = '-' + GIcon._THEME_DEFAULT; break;
            case ''       : this.theme = ''; break;
            default       : this.theme = '-' + this.dataset.theme; break;
        }

        this.classList.add(`material-icons${this.theme}`);

        // Get the possible transform property of the existing element.
        let transform = window.getComputedStyle(this).getPropertyValue('transform');
        transform = (transform !== 'none') ? transform : '';

        // Set the translateX value if needed.
        this.x = (this.dataset.x !== undefined && this.dataset.x !== '') ? parseFloat(this.dataset.x) : 0;
        transform += (this.x !== 0) ? ` translateX(${this.x}px)` : '';

        // Set the translateY value if needed.
        this.y = (this.dataset.y !== undefined && this.dataset.y !== '') ? parseFloat(this.dataset.y) : 0;
        transform += (this.y !== 0) ? ` translateY(${this.y}px)` : '';

        this.style.transform = transform;

        // Remove the data attributes.
        delete this.dataset.name;
        delete this.dataset.theme;
        delete this.dataset.x;
        delete this.dataset.y;
    }
}

customElements.define('g-icon', GIcon);
