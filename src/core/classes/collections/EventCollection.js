const { EventEmitter } = require('events');
const Collection = require('./Collection');
const collection = Symbol('collection');


class EventCollection extends EventEmitter {
    constructor() {
        super();

        this[collection] = new Collection();
    }

    get size() {
        return this[collection].size;
    }

    has(key) {
        return this[collection].has(key);
    }

    get(key) {
        return this[collection].get(key);
    }

    set(key, value) {
        return this[collection].set(key, value);
    }

    delete(key) {
        return this[collection].delete(key);
    }

    keys() {
        return this[collection].keys();
    }

    values() {
        return this[collection].values();
    }

    entries() {
        return this[collection].entries();
    }

    forEach(...args) {
        return this[collection].forEach(...args);
    }

    filter(...args) {
        return this[collection].filter(...args);
    }

    map(...args) {
        return this[collection].map(...args);
    }
}

module.exports = EventCollection;
