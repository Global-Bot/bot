const axios = require('axios');

class Fetcher {
    constructor(api, options) {
        this.api = api;
        this.options = options || {};
        this.initFetchAmount = this.options.initFetchAmount || 10;

        this._cache = [];
        this.init();
    }

    init() {
        for (let i = 0; i < this.initFetchAmount; i++) {
            this.fetch(true).catch(() => null);
        }
    }

    async fetch(prefetch) {
        let result = await axios.get(this.api, this.options).catch(() => null);

        if (prefetch) {
            this._cache.push(result);
        } else {
            return result;
        }
    }

    async get() {
        let result;

        if (this._cache[0]) {
            result = this._cache.splice(0, 1)[0];
        } else {
            result = await this.fetch(false);
        }

        this.fetch(true).catch(() => null);

        return Object.hasOwnProperty.call(result, 'data') ? result.data : result;
    }
}

module.exports = Fetcher;
