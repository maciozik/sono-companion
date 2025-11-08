/** @type {NodeListOf<HTMLElement>} */
const $inputBoxes = document.querySelectorAll('.input-box');

/**
 * Init the module and its components.
 * Called only once during application startup.
 */
export function __init__() {

    for (const $inputBox of $inputBoxes) {

        const $input = $inputBox.querySelector('input');

        // Click on an input box.
        $inputBox.addEventListener('click', function () {
            this.querySelector('input').focus();
        });

        // Select all the input content on focus.
        $input.addEventListener('focus', function () {
            this.select();
        });

        // Input loses focus on validate key.
        $input.addEventListener('keydown', function (event) {
            if (event.key === 'Enter') {
                this.blur();
            }
        });

        // Disable the context menu.
        $input.addEventListener('contextmenu', event => event.preventDefault());
    }
}
