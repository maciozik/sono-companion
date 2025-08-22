import Modal from '../classes/Modal.js';
import Setting from '../classes/Setting.js';
import * as Settings from '../views/settings.js';

export default class SettingList extends Setting
{
    value = new String();
    default_value = new String();

    /**
     * The `select-list` element that must be copied in the modal.
     * @type {HTMLElement}
     */
    $list;

    /**
     * Whether the vibration occurs when the user validates or after the confirmation modal closes.
     * @type {'validation'|'modal-close'|null}
     */
    vibrate_on = new String();

    constructor ()
    {
        super();

        this.value = this.querySelector('[data-selected]').dataset.value;
        this.default_value = this.value;
        this.vibrate_on = this.dataset.vibrateOn ?? null;

        // Remove the useless attributes.
        this.removeAttribute('data-vibrate-on');
    }

    /**
     * When the element is connected to the DOM.
     */
    connectedCallback()
    {
        super.connectedCallback();

        // Render the setting and bind the events.
        this.render();
        this.bindEvents();

        // Set the necessary elements.
        this.$list = this.querySelector('.select-list');
    }

    /**
     * Entry point at a user interaction.
     */
    trigger()
    {
        this.showList();
    }

    /**
     * Set the item value as selected in the select list.
     * @param {string} value The value of the selected item.
     * @returns {boolean} False if the selected value is not in the list.
     */
    set(value)
    {
        let $selectedItem = this.$list.querySelector(`[data-value="${value}"]`);

        // If the selected value is in the list, select it.
        if ($selectedItem !== null) {
            this.value = $selectedItem.dataset.value;
            SettingList.selectItem($selectedItem, this.$list);
        }
        else {
            return false;
        }

        return true;
    }

    /**
     * Show the select list in the modal.
     */
    showList()
    {
        // Define the modal with the items in it.
        const ItemsModal = new Modal(null, this.$list.innerHTML);

        // Define the primary button callback to validate the item selected.
        ItemsModal.setPrimaryBtn(undefined, () => {
            this.validate();
        });

        // Open the modal.
        ItemsModal.open();
    }

    /**
     * Select the item selected by the user in the modal.
     * @param {HTMLElement} $selectedItem
     * @param {HTMLElement} $container The container of the items to update (either the select list or the modal).
     */
    static selectItem($selectedItem, $container)
    {
        const $items = $container.querySelectorAll('.select-item');

        $items.forEach($item => $item.toggleAttribute('data-selected', false));
        $selectedItem.toggleAttribute('data-selected', true);
    }

    /**
     * Set the item selected by the user.
     */
    validate()
    {
        const _this = this;

        // Get the value of the current selected item.
        let selected_item_value = Modal.$modal.querySelector('[data-selected]').dataset.value;

        // Close the modal, then set the selected item as selected in the settings view.
        Modal.close().then(() => {
            _this.set(selected_item_value);
            Settings.change(_this.name, selected_item_value, _this.context);

            if (this.vibrate_on === 'modal-close') { app.vibrate(); }
        });

        if (this.vibrate_on === 'validation') { app.vibrate(); }
    }

    /**
     * Render the HTML.
     */
    render()
    {
        // Add the class and the tappable options.
        this.classList.add('setting');
        this.dataset.tappable = 'click follow-tap';

        // Set the content.
        this.innerHTML = `
            <div class="setting-text">
                <p class="setting-title ${ this.danger ? 'danger' : ''}">
                    ${this.title} ${super.getResetButtonHTML()}
                </p>
                ${super.getInfoHTML()}
            </div>
            <div class="setting-choice">
                <div class="select-list">
                    ${this.getSelectItemsHTML()}
                </div>
                <g-icon data-name="chevron_right" data-y=0.3></g-icon>
            </div>
        `;
    }

    /**
     * Get the HTML of the list of all the select items.
     * @returns {string}
     */
    getSelectItemsHTML()
    {
        let select_items_html = '';

        for (const $item of this.querySelectorAll('select-item')) {
            let value = $item.dataset.value;
            let label = $item.innerHTML;
            let selected = ($item.hasAttribute('data-selected')) ? 'data-selected' : '';

            select_items_html += `
                <div class="select-item" data-value="${value}" ${selected}>
                    <span class="radio-btn"></span>
                    <span>${label}</span>
                </div>
            `;
        }

        return select_items_html;
    }

    /**
     * Bind some generic events to the setting.
     */
    bindEvents()
    {
        super.bindEvents();
    }
}

customElements.define('setting-list', SettingList);
