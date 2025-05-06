/**
 * Bind an event dynamically to an element that already exists or not.
 * @param {string} type A case-sensitive string that represent the event type to listen to.
 * @param {string} selector The selector of the element to bind the event to.
 * @param {EventListener|EventListenerObject} listener The object that receives a notification when an event of the specified type occurs.
 * @param {boolean|EventListenerOptions} [options]
 * @memberof Document|HTMLElement
 */
function addDynamicEventListener(type, selector, listener, options = false)
{
    this.addEventListener(type, function(event) {
        const $element = event.target.closest(selector);
        if ($element !== null) {
            listener.call($element, event);
        }
    }, options);
}

Document.prototype.addDynamicEventListener = addDynamicEventListener;
HTMLElement.prototype.addDynamicEventListener = addDynamicEventListener;
