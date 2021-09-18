class Module {
    constructor(global) {
        this._global = global;
    }

    get global() {
        return this._global
    }
}

module.exports = Module;
