import Modal from '../classes/Modal.js';
import Setting from '../classes/Setting.js';

export default class SettingAction extends Setting
{
    /**
     * The module to load (from the js\ folder, without the .js extension).
     * @type {string|null}
     */
    module = new String();

    /**
     * The method to execute from the module if it exists, or an arbitrary code.
     * @type {Function}
     */
    action = new Function();

    has_action = new Boolean();
    require_confirmation = new Boolean();

    /**
     * Whether the vibration occurs when the user validates or after the confirmation modal closes.
     * @type {'validation'|'modal-close'|null}
     */
    vibrate_on = new String();

    constructor ()
    {
        super();

        this.module = this.dataset.module || null;

        this.has_action = (this.dataset.action !== undefined) ? true : false;
        this.require_confirmation = (this.dataset.requireConfirmation === undefined || this.dataset.requireConfirmation === 'false') ? false : true;
        this.vibrate_on = this.dataset.vibrateOn ?? null;

        // Remove the useless attributes.
        this.removeAttribute('data-module');
        this.removeAttribute('data-require-confirmation');
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

        // Set the action.
        this.setAction();
    }

    /**
     * Entry point at a user interaction.
     */
    trigger()
    {
        this.handle();
    }

    /**
     * Set the action to execute if needed.
     */
    async setAction()
    {
        if (this.has_action) {

            // Get the action to execute.
            const action = this.dataset.action.trim();

            // If the module exists, set the method from the module as the action.
            if (this.module !== null) {
                const module_path = `../${this.module}.js`;
                const module = await import(module_path);
                this.action = module[action];
            }
            // Else, set the arbitrary code as the action.
            else {
                this.action = () => eval(action);
            }
        }

        // Remove the useless attributes.
        this.removeAttribute('data-action');
    }

    /**
     * Handle the interection with the setting, by either showing a confirmation modal if needed, or executing the action directly.
     */
    handle()
    {
        if (this.has_action) {
            // If a confirmation is required, show the confirmation modal.
            if (this.require_confirmation) {
                this.showConfirmation();
            }
            // Else, execute the action directly.
            else {
                this.execute();
            }
        }
    }

    /**
     * Show the confirmation modal.
     */
    showConfirmation()
    {
        const _this = this;
        let text = "Voulez-vous vraiment " + (this.title[0].toLowerCase() + this.title.slice(1)) + " ?"

        const ConfirmationModal = new Modal(null, text);

        // Define the primary button callback to execute the action.
        ConfirmationModal.setPrimaryBtn(undefined, () => {

            Modal.close().then(() => {
                _this.execute();
                if (this.vibrate_on === 'modal-close') { app.vibrate(30); }
            });

            if (this.vibrate_on === 'validation') { app.vibrate(30); }
        });

        // Open the modal.
        ConfirmationModal.open();
    }

    /**
     * Execute the action.
     */
    execute()
    {
        this.action();
    }

    /**
     * Render the HTML.
     */
    render()
    {
        // Add the class and the tappable options if needed.
        this.classList.add('setting');

        if (this.has_action) {
            this.dataset.tappable = 'click follow-tap';
        }

        // Set the content.
        this.innerHTML = `
            <div class="setting-text">
                <p class="setting-title ${ this.danger ? 'danger' : ''}">
                    ${this.title}
                </p>
                ${this.getInfoHTML()}
            </div>
            <div class="setting-choice">
                ${this.getRightIconHTML()}
            </div>
        `;
    }

    /**
     * Get the HTML of the info tag if there is an info to show, and add an additional message if a confirmation is required.
     * @returns {string|''}
     */
    getInfoHTML()
    {
        this.info += (this.require_confirmation) ? " <b>Une confirmation vous sera demandée.</b>" : "";
        return super.getInfoHTML();
    }

    /**
     * Get the HTML of the right arrow icon if there is an action to execute.
     * @returns {string|''}
     */
    getRightIconHTML()
    {
        return (this.has_action) ? `
            <g-icon data-name="chevron_right"></g-icon>
        ` : '';
    }

    /**
     * Bind some generic events to the setting.
     */
    bindEvents()
    {
        super.bindEvents();
    }

    // These methods are not implemented in this class.
    set() { return false; }
    reset() {}
    getResetButtonHTML() {}
}

customElements.define('setting-action', SettingAction);
