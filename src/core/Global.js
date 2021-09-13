const { Client } = require('discord.js');
const config = require('./config');

class Global {
    constructor() {
        this.isReady = false;
    }

    get client() {
        return this._client;
    }

    get config() {
        return config;
    }

    async init(options) {
        options = options || {};
        
        this.options = Object.assign(config.clientOptions, options);

        this._client = new Client(this.options);

		this.client.once('ready', this.ready.bind(this));
    }

    ready() {
		this.isReady = true;
    }
}

module.exports = Global;