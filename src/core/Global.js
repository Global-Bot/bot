const { Client } = require('discord.js');

const config = require('./config');
const db = require('./database')
const utils = require('./utils');
const logger = require('./logger');
const EventManager = require('./classes/managers/EventManager');
const GlobalGuildManager = require('../modules/GlobalGuildManager');

class Global {
    constructor() {
        this.isReady = false;

        process.on('unhandledRejection', this.handleRejection.bind(this));
		process.on('uncaughtException', this.handleException.bind(this));
    }

    get client() {
        return this._client;
    }

    get config() {
        return config;
    }

    get db() {
        return db;
    }

    get models() {
        return db.models;
    }

    get utils() {
        return utils;
    }

    get logger() {
        return logger;
    }

    async init(options) {
        options = options || {};
        
        this.options = Object.assign(config.clientOptions || {}, options);

        this._client = new Client(this.options);

        const DJSLogger = this.logger.get('D.JS');

        this.client.on('error', err => {
            DJSLogger.error(err);
            this.logger.logWebhook(`Client Error`, null, {
                webhook: 'errors',
                username: 'Client Error',
                text: `Client encountered an error: ${err.message}`,
                suppress: true
            });
        });
		this.client.on('warn', err => {
            DJSLogger.error(err);
            this.logger.logWebhook(`Client Warn`, null, {
                webhook: 'warns',
                username: 'Client Warn',
                text: `Client encountered an warning: ${err.message}`,
                suppress: true
            });
        });
		this.client.on('debug', msg => {
			if (typeof msg === 'string') {
				msg = msg.replace(config.token, 'token');
			}

			DJSLogger.debug(msg);
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

        this.logger.get('Client').info(`${this.client.user.username} is online with ${this.client.guilds.cache.size} guilds & ${this.client.users.cache.size} users`, 'Ready')
    }

    login() {
        this.client.login(this.config.token);
        
        return true;
    }

    handleRejection(reason, p) {
        console.error('Unhandled rejection at: Promise', p, 'reason:', reason);
        this.logger.logWebhook(`Rejection Error`, null, {
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
        
        this.logger.get('CrashReport').error(report);
        this.logger.logWebhook(`Exception Error`, null, {
            webhook: 'exceptions',
            username: 'Exception Error',
            text: err.message,
            suppress: true
        });
	}
}

module.exports = Global;
