const screen = require('./screen');

const tryCall = (object, name, args = []) => {
    if (object && typeof object[name] === 'function') {
        return object[name].apply(object, args);
    }
}

/**
 * A state machine, handling the passing of all input and rendering calls
 * 
 * @class StateMachine
 */
class StateMachine {
    constructor() {
        this._views = new Map();
        this._current = null;
    }

    get current() {
        return this._views.get(this._current);
    }

    addView(view) {
        let { name } = view;

        if (this._views.has(name)) {
            throw new Error(`The view '${name}' already exists`);
        }

        this._views.set(name, view);
    }

    removeView(view) {
        let name = view.name || view;

        return this._views.delete(name);
    }

    quit() {
        tryCall(this.current, 'onLeave');
    }

    changeView(view) {
        let name = view.name || view;
        let old = this._current;
        tryCall(this.current, 'onLeave', [name]);
        this._current = name;
        tryCall(this.current, 'onEnter', [old]);
    }

    input(key) {
        return tryCall(this.current, 'onKeyDown', [key]);
    }

    tick() {
        return tryCall(this.current, 'tick');
    }

    render() {
        return tryCall(this.current, 'render');
    }

    shouldRender() {
        return tryCall(this.current, 'shouldRender');
    }

}

module.exports = StateMachine;