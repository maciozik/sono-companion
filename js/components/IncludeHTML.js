export default class IncludeHTML extends HTMLElement
{
    src = new String();

    constructor ()
    {
        super();
    }

    /**
     * When the element is connected to the DOM.
     */
    connectedCallback()
    {
        this.src = this.getAttribute('src');

        fetch(this.src)
            .then(response => {
                if (!response.ok) throw new Error(response.status);
                return response.text();
            })
            .then(data => {
                // Create a temporary container.
                const container = document.createElement("div");
                container.innerHTML = data;

                // Insert each child of the container before the include-html element.
                while (container.firstChild) {
                    this.parentNode.insertBefore(container.firstChild, this);
                }

                // Remove the include-html element.
                this.remove();
            })
            .catch(error => console.error(`Including ${this.src}: ${error}`));
    }
}

customElements.define('include-html', IncludeHTML);
