/**
 * ## state
 *
 * @module
 */
export class DiscreteState {
    stateValue;
    subscribers;
    constructor(initialValue = 0, stateValues = 2) {
        this.stateValue = initialValue;
        this.subscribers = [];
    }
    subscribe(notifier) {
        this.subscribers.push(notifier);
    }
    get value() {
        return this.stateValue;
    }
    set value(newValue) {
        this.stateValue = newValue;
        this.subscribers.forEach((n) => n(newValue));
    }
    toString() {
        return this.stateValue;
    }
}
