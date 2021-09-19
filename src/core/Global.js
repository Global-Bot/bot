const { Client } = require('discord.js');
const Base = require('./classes/Base');
const EventManager = require('./classes/managers/EventManager');
const GlobalGuildManager = require('../modules/GlobalGuildManager');

class Global extends Base {
    constructor() {
        super();
        
        this.isReady = false;

        process.on('unhandledRejection', this.handleRejection.bind(this));
		process.on('uncaughtException', this.handleException.bind(this));
    }

    get client() {
        return this._client;
    }

    async init(options) {
        options = options || {};
        
        this.options = Object.assign(this.config.clientOptions || {}, options);

        this._client = new Client(this.options);


        this.client.on('error', err => {
            this.logger.error(err, 'D.JS');
            this.logWebhook(`Client Error`, null, {
                webhook: 'errors',
                username: 'Client Error',
                text: `Client encountered an error: ${err.message}`,
                suppress: true
            });
        });
		this.client.on('warn', err => {
            this.logger.error(err, 'D.JS');
            this.logWebhook(`Client Warn`, null, {
                webhook: 'warns',
                username: 'Client Warn',
                text: `Client encountered an warning: ${err.message}`,
                suppress: true
            });
        });
		this.client.on('debug', msg => {
			if (typeof msg === 'string') {
				msg = msg.replace(this.config.token, 'token');
			}

            this.logger.debug(msg, 'D.JS');
		});

        // Managers
        this.dispatcher = new EventManager(this);

        // Modules
        this.guildManager = new GlobalGuildManager(this);

        this.client.once('ready', this.ready.bind(this));

        this.login();
    }

    ready() {
        this.dispatcher.bindListeners();
        
        this.isReady = true;

        this.logger.info(`${this.client.user.username} is online with ${this.client.guilds.cache.size} guilds & ${this.client.users.cache.size} users`, 'Ready')
    }

    login() {
        this.client.login(this.config.token);
        
        return true;
    }

    handleRejection(reason, p) {
        console.error('Unhandled rejection at: Promise', p, 'reason:', reason);
        this.logWebhook(`Rejection Error`, null, {
            webhook: 'rejections',
            username: 'Rejection Error',
            text: reason.message,
            suppress: true
        });
	}

    handleException(err) {
		const time = (new Date()).toISOString();
        const report = [
            `Crash Report ${time}:`,
            err.stack,
            `Client Options: ${JSON.stringify(this.config.clientOptions)}`
        ].join('\n\n');
        
        this.logger.error(report, 'CrashReport');
        this.logWebhook(`Exception Error`, null, {
            webhook: 'exceptions',
            username: 'Exception Error',
            text: err.message,
            suppress: true
        });
	}
}

module.exports = Global;
