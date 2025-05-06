/**
 * Represents a slider.
 */
export default class Slider
{
    /** @type {number} @readonly */
    static POINTER_X_DECAY_ALLOW_MOVABLE = 10;

    value = new Number();
    suffix = new String();

    min = new Number();
    max = new Number();
    range = new Number();
    step = new Number();

    values = new Object();
    gap = new Number();

    is_movable = false;

    #pointerEventsAbort = new AbortController();

    $slider;
    $sliderLine;

    /**
     * @constructor
     * @param {HTMLElement} $slider
     */
    constructor ($slider)
    {
        this.$slider = $slider;
        this.$sliderLine = this.$slider.querySelector('.slider-line');

        this.value = parseFloat(this.$slider.dataset.value);
        this.suffix = this.$slider.dataset.suffix;

        this.min = parseFloat(this.$slider.dataset.min);
        this.max = parseFloat(this.$slider.dataset.max);
        this.step = parseFloat(this.$slider.dataset.step);
    }

    /**
     * Set the current value of the slider.
     * @param {number} value
     * @returns {boolean} False if the value is not in the values of the slider.
     */
    setValue(value)
    {
        if (this.values[value] !== undefined) {
            this.value = value;
            this.$slider.dataset.value = this.value;
        } else {
            return false;
        }

        return true;
    }

    /**
     * Set the position of the slider thumb.
     * @param {number} [position] *Default: the position of the current value.*
     */
    setPosition(position = this.getPositionFromValue(this.value))
    {
        this.$slider.style.setProperty('--slider-thumb-left', `${position}px`);
    }

    setStep(step)
    {
        this.step = step;
        this.$slider.dataset.step = this.step;
        this.init();
    }

    /**
     * Get the position of a value.
     * @param {number} value
     * @returns {number|null}
     */
    getPositionFromValue(value)
    {
        this.init();
        let position = this.values[value]?.position;
        return (position !== undefined) ? position : null;
    }

    /**
     * Move the slider thumb depending on the user pointer.
     * @param {number} pointer_x
     */
    move(pointer_x)
    {
        let position = pointer_x - this.$sliderLine.getBoundingClientRect().left;

        // Clamp the position in the width of the slider.
        position = Math.clamp(position, 0, this.$sliderLine.width);

        // Move the slider thumb.
        this.setPosition(position);

        // Check if the value must be updated.
        this.checkValues(position);
    }

    /**
     * Check if the value of the slider must be updated depending on the position of the slider thumb.
     * @param {number} position
     * @fires `change` on $slider.
     */
    checkValues(position)
    {
        for (let value in this.values) {

            let threshold_left = this.values[value].threshold_left;
            let threshold_right = this.values[value].threshold_right;
            value = parseFloat(value);

            // If the position is inside its threshold.
            if (value !== this.value && position >= threshold_left && position <= threshold_right) {

                // Update the value.
                this.setValue(value);

                // Emit the 'change' event on the slider.
                this.emitEvent('change');

                break;
            }
        }
    }

    /**
     * Get the current value with its suffix.
     * @returns {string}
     */
    getValueWithSuffix()
    {
        let value = this.value.addZeros(this.getNbDecimals(), 'trailing');

        // Add the signs if necessary.
        if (this.min < 0) {
            value = (this.value < 0) ? value.replace('-', '−') : '+' + value;
        }

        return value + this.suffix;
    }

    /**
     * Get the number of decimals to apply depending on the step value.
     * @returns {number}
     */
    getNbDecimals()
    {
        let step_float = Math.float(this.step);
        return (step_float === '0') ? 0 : step_float.length;
    }

    /**
     * Initialize the slider.
     */
    init()
    {
        this.range = this.max - this.min;
        this.$sliderLine.width = this.$sliderLine.offsetWidth;

        // Define the properties of all the possible values of the slider.
        let nb_values = (this.range / this.step) + 1;
        let nb_decimals = this.getNbDecimals();

        this.values = {};
        this.gap = this.$sliderLine.width / (nb_values - 1);

        for (let i = this.min; i <= this.max; i = Math.roundFloat((i + this.step), nb_decimals)) {

            let position = (i - this.min) / this.step * this.gap;
            let threshold_left = position - (this.gap / 2);
            let threshold_right = position + (this.gap / 2);

            this.values[i] = {
                position: position,
                threshold_left: Math.max(0, threshold_left),
                threshold_right: Math.min(threshold_right, this.$sliderLine.width)
            };

            // Set the position of the point zero if necessary.
            if (i === 0 && this.min < 0 && this.max > 0) {
                this.$slider.style.setProperty('--point-zero-left', `${position}px`);
            }
        }

        // If the step value is not correct.
        if (Math.float(nb_values) !== '0') {
            console.warn(`The step value (${this.step}) is not a divider of the range of the slider (${this.range}).`);
        }
        // If there is too much values.
        else if (nb_values > this.$sliderLine.width) {
            console.warn(`The number of values (${nb_values}) exceeds the width of the slider (${this.$sliderLine.width}).`);
        }

        // TODO Remove.
        // this.showVisualClues();
    }

    /**
     * Bind the pointer events listeners to the slider.
     */
    bindEvents()
    {
        const _this = this;

        this.$slider.addEventListener('pointerdown', function (event) {

            // Define all the possible values of the slider.
            _this.init();

            // Create a controller to abort the events after a pointer release.
            _this.#pointerEventsAbort = new AbortController();

            // Bind the 'pointermove', 'pointerup' and 'pointercancel' events.
            _this.bindPointerMove(event);
            _this.bindPointerUp();
            _this.bindPointerCancel();
        });
    }

    /**
     * Bind the 'pointermove' event to the slider.
     * @param {PointerEvent} pointerdown_event The event of the first contact with the pointer.
     * @fires `move` on $slider.
     */
    bindPointerMove(pointerdown_event)
    {
        const _this = this;

        document.addEventListener('pointermove', function (event) {

            // If the pointer moved enough to the left or right, activate the 'movable' state.
            if (Math.abs(pointerdown_event.clientX - event.clientX) > Slider.POINTER_X_DECAY_ALLOW_MOVABLE) {
                _this.is_movable = true;
                _this.$slider.classList.add('movable');
            }

            // Only if the 'movable' state is activated.
            if (_this.is_movable) {
                // Move the slider thumb depending on the user pointer.
                _this.move(event.clientX);

                // Emit the 'move' event on the slider.
                // TODO Useless?
                _this.emitEvent('move', event);
            }
        }, {
            signal: _this.#pointerEventsAbort.signal
        });
    }

    /**
     * Bind the 'pointerup' event to the slider.
     * @fires `end` on $slider.
     */
    bindPointerUp()
    {
        const _this = this;

        document.addEventListener('pointerup', function (event) {

            // Only if the slider thumb has been moved already.
            if (_this.is_movable) {

                // Force the position of the slider thumb when the pointer is released.
                _this.setPosition();

                // Emit the 'end' event on the slider.
                _this.emitEvent('end', event);

                // Deactivate the 'movable' state.
                _this.is_movable = false;
                _this.$slider.classList.remove('movable');
            }

            // Abort the 'pointermove' and 'pointerup' events.
            _this.#pointerEventsAbort.abort();
        }, {
            signal: _this.#pointerEventsAbort.signal
        });
    }

    /**
     * Bind the 'pointercancel' event to the slider.
     */
    bindPointerCancel()
    {
        const _this = this;

        document.addEventListener('pointercancel', function (event) {
            // Abort the 'pointermove' and 'pointerup' events.
            _this.#pointerEventsAbort.abort();
        }, {
            signal: _this.#pointerEventsAbort.signal
        });
    }

    /**
     * Emit an event to notify when the value or the state of the slider changes.
     * @param {'move'|'change'|'end'} type The type of the event to emit.
     * @param {Event|null} source_event The event that triggered the emission.
     * @fires `move`|`change`|`end` on $slider.
     */
    emitEvent(type, source_event = null)
    {
        this.$slider.dispatchEvent(new CustomEvent(type, { detail: {
            value: this.value,
            source_event: source_event
        }}));

        if (type !== 'move') console.debugType('emit_event', type, this.value);
    }

    /** FOR DEV PURPOSE ONLY */
    // TODO Remove.
    showVisualClues()
    {
        for (let i = this.min; i <= this.max; i += this.step) {

            let $value = document.createElement('div');
            Object.assign($value.style, {
                position: 'absolute',
                left: `${this.values[i].position}px`,
                height: '100%',
                borderLeft: '1px solid var(--invert)',
            });
            this.$slider.querySelector('.slider-line').appendChild($value);

            let $range = document.createElement('div');
            Object.assign($range.style, {
                position: 'absolute',
                left: `${this.values[i].threshold_left}px`,
                width: '2px',
                height: '2px',
                backgroundColor: 'var(--grey)',
            });
            this.$slider.querySelector('.slider-line').appendChild($range);
        }
    }
}
