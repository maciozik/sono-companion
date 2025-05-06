/**
 * @description
 * A tappable is an element that trigger a circle growing animation when pressed.
 * It is defined by the presence of the 'data-tappable' attribute.
 *
 * Several options can be defined in this attribute, separated by white spaces:
 *  - `pointerdown`     : Trigger the animation on pointerdown event.
 *  - `pointerup`       : Trigger the animation on pointerup event.
 *  - `click`           : Trigger the animation on click event.
 *  - `trigger-manually`: The animation will not be triggered by an event and must be triggered manually.
 *  - `follow-tap`      : The animation is triggered at the position of the tap.
 *  - {Any raw number}  : The opacity of the circle (ie. 0.2).
 *  - {Any duration}    : The animation duration of the circle (ie. 200ms, 1s).
 *
 * Moreover, the following classes can change the behavior of the element:
 *  - `disabled`        : The animation will not be triggered at all.
 *  - `cancel-tappable` : If present on a child element, any action targeting that element or their descendants will no longer trigger the animation.
 */

const $tappables = document.querySelectorAll('[data-tappable]');

// Click on a tappable element.
for (const $tappable of $tappables) {

    // Set the options.
    $tappable.options = $tappable.dataset.tappable.split(' ');

    $tappable.is = function (option) {
        return $tappable.options.includes(option);
    }

    // Set the style of the circle.
    for (let option of $tappable.options) {

        // If the option is a number.
        if (isFinite(option)) {
            $tappable.style.setProperty('--circle-opacity', option);
        }

        // If the option is a duration.
        if (option.endsWith('ms') || option.endsWith('s')) {
            $tappable.style.setProperty('--circle-animation-duration', option);
        }
    }

    /**
     * Trigger the animation.
     * @param {Event} event
     */
    $tappable.triggerTappable = function (event) {

        // If the element is not disabled, and if no cancel-tappable element exists.
        if (!this.classList.contains('disabled') && event.target.closest('.cancel-tappable') === null) {

            let circle = new DOMRect();
            let tappable = this.getBoundingClientRect();
            circle.x = event.clientX - tappable.left;
            circle.y = event.clientY - tappable.top;

            // Clamp the circle position inside the element.
            circle.x = Math.clamp(circle.x, 0, tappable.width);
            circle.y = Math.clamp(circle.y, 0, tappable.height);

            // Set the circle position.
            this.style.setProperty('--circle-x', `${circle.x}px`);
            this.style.setProperty('--circle-y', `${circle.y}px`);
            this.style.setProperty('--tappable-width', `${tappable.width}px`);
            this.style.setProperty('--tappable-height', `${tappable.height}px`);

            // Run the animation.
            this.classList.add('ontap');
        }
    }

    // Define the type of event.
    let event_type = 'pointerdown';

    if ($tappable.is('click')) {
        event_type = 'click';
    }
    else if ($tappable.is('pointerup')) {
        event_type = 'pointerup';
    }

    // Trigger the animation on the event, except if it must be triggered manually.
    $tappable.addEventListener(event_type, function (event) {
        if (!this.is('trigger-manually')) {
            this.triggerTappable(event);
        }
    });

    // Reset the animation after it ends.
    $tappable.addEventListener('animationend', function () {
        this.classList.remove('ontap');
    });
}
