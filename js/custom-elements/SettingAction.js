import Setting from '/js/classes/Setting.js';
import Modal from '/js/classes/Modal.js';
import Toast from '/js/classes/Toast.js';

/**
 * Represents a setting that can execute an action.
 *
 * A `data-action` attribute indicates the action to do when triggered. It can either be:
 *  - The name of the method to call from a JS module.
 *  - A standalone code to evaluate directly.
 *
 * In the first case, the JS module **must** be declared using the `data-module` attribute.
 * The value of this attribute must be the link to the module, relative to the js/ folder without the extension.
 *
 * **If `data-action` is not declared**, nothing will happen when triggered. It can be useful to display information.
 *
 * **If `data-action` is declared**, the following attributes may be declared optionally:
 *  - `data-require-confirmation` : Whether a confirmation modal must be displayed before executing the action.
 *                                  The text of the modal will use the value of this attribute, or a default generic message if none.
 *  - `data-new-window` : Whether the action will open a new window (this will change the icon at the right of the setting).
 *  - `data-vibrate-on` : If set to `validation`, a vibration will occur when the validation button of the confirmation modal is triggered.
 *                        If set to `modal-close`, a vibration will occur only after the confirmation modal closes completely.
 *
 * @example // For a `reset` method to call from a module js/views/settings.js.
 *  <setting-action
 *      data-name="reset_settings"
 *      data-module="views/settings" data-action="reset" data-require-confirmation>
 *          <h3>Reset all the settings</h3>
 *  </setting-action>
 */
export default class SettingAction extends Setting
{
    /** @type {string|null} The module to load if necessary. */
    module = new String();

    /** @type {Function} The method to call from the module, or a standalone code. */
    action = new Function();

    has_action = new Boolean();
    require_confirmation = new Boolean();
    open_new_window = new Boolean();

    /** @type {'validation'|'modal-close'|null} */
    vibrate_on = new String();

    constructor ()
    {
        super();

        this.module = this.dataset.module ?? null;

        this.has_action = (this.dataset.action !== undefined) ? true : false;
        this.require_confirmation = this.hasBooleanAttribute('data-require-confirmation');
        this.open_new_window = this.hasBooleanAttribute('data-new-window');
        this.vibrate_on = this.dataset.vibrateOn ?? null;

        // Remove the useless attributes.
        this.removeAttribute('data-module');
        this.removeAttribute('data-new-window');
        this.removeAttribute('data-vibrate-on');

        // Add the attributes again without values for CSS purpose.
        this.toggleAttribute('data-new-window', this.open_new_window);
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
     * Set the action to execute if necessary.
     */
    setAction()
    {
        if (!this.has_action) return;

        // Get the action to execute.
        const action = this.dataset.action.trim();

        // If the module exists, set the action to call the method dynamically.
        if (this.module !== null) {
            const module_path = `../${this.module}.js`;
            this.action = () => import(module_path)
                .then(module => module[action].call())
                .catch(() => (new Toast("Un problème est survenu, veuillez réessayer.")).show());
        }
        // Else, set the standalone code as the action.
        else {
            this.action = () => eval(action);
        }

        // Remove the useless attributes.
        this.removeAttribute('data-action');
    }

    /**
     * Handle the interection with the setting,
     * by either showing a confirmation modal if necessary, or executing the action directly.
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
        let text;

        // Either use the value of the attribute, or the title of the setting in a generic message.
        if (this.dataset.requireConfirmation !== 'true' && this.dataset.requireConfirmation !== '') {
            text = this.dataset.requireConfirmation;
        }
        else {
            text = /*html*/`
                Voulez-vous vraiment <b>${(this.title[0].toLowerCase() + this.title.slice(1))}&nbsp;?</b>
            `;
        }

        const ConfirmationModal = new Modal(null, text);

        // Define the primary button callback to execute the action.
        ConfirmationModal.setPrimaryBtn("Confirmer", () => {

            Modal.close().then(() => {
                _this.execute();
                if (this.vibrate_on === 'modal-close') { app.vibrate(30); }
            });

            if (this.vibrate_on === 'validation') { app.vibrate(30); }
        });

        ConfirmationModal.open();
    }

    /**
     * Execute the action.
     */
    execute()
    {
        this.action.call();
    }

    /**
     * Render the HTML.
     */
    render()
    {
        // Add the class, and the trigger/ripple options if necessary.
        this.classList.add('setting');

        if (this.has_action) {
            this.dataset.trigger = 'click';
            this.dataset.ripple = 'follow-tap';
        }

        // Set the content.
        this.innerHTML = /*html*/`
            <div class="setting-text">
                <h3 class="setting-title">
                    ${this.title}
                </h3>
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
        if (this.has_action) {
            if (this.open_new_window) {
                return `<g-icon data-name="open_in_new"></g-icon>`;
            } else {
                return `<g-icon data-name="chevron_right"></g-icon>`;
            }
        }
        return '';
    }

    /**
     * Bind some generic events to the setting.
     */
    bindEvents()
    {
        super.bindEvents();
    }

    // These methods are not implemented in this class.
    set() { return undefined; }
    getValueAsText() { return undefined; }
    reset() {}
    getResetButtonHTML() {}
}

customElements.define('setting-action', SettingAction);
