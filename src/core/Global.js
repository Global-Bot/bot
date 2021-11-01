const { Client } = require('discord.js');
const Base = require('./classes/Base');
const Structures = require('../structures');
const EventManager = require('./classes/managers/EventManager');
const EventEmitter = require('events');
const CommandCollection = require('./classes/collections/CommandCollection');
const ModuleCollection = require('./classes/collections/ModuleCollection');
const PermissionsManager = require('./classes/managers/PermissionsManager');
const LotteryManager = require('./classes/managers/LotteryManager');
const CooldownManager = require('./classes/managers/CooldownManager');
const BoostReactionManager = require('./classes/managers/BoostReactionManager');
const DropManager = require('./classes/managers/DropManager');
const LeaderboardManager = require('./classes/managers/LeaderboardManager');


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
        
        Structures.load();
        
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

        this.dispatcher = new EventManager(this);
        this.globalEvents = new EventEmitter();

        // Collections
        this.commands = new CommandCollection(this);
        this.modules = new ModuleCollection(this);

        // Managers
        this.permissions = new PermissionsManager(this);
        this.lottery = new LotteryManager(this);
        this.drop = new DropManager(this);
        this.cooldown = new CooldownManager(this);
        this.boostReact = new BoostReactionManager(this);
        this.leaderboard = new LeaderboardManager(this);
        
        this.client.once('ready', this.ready.bind(this));
        this.client.on('messageUpdate', (oldMessage, newMessage) => {
            this.client.emit('messageCreate', newMessage)
        })

        this.login();
    }

    cacheMembers() {
        for (const [ id, guild ] of this.client.guilds.cache) {
            guild.members.fetch()
            .catch(this.logger.error);
        }
    }

    ready() {
		this.logger.info(`[${this.config.stateName}] ${this.config.name} ready with ${this.client.guilds.cache.size} guilds`);
        this.client.guilds.cache.map(guild => this.logger.trace('\tGuild: ' + guild.name));
        
        this.dispatcher.bindListeners();
        
        this.cacheMembers();

        this.user = this._client.user;
        this.userID = this._client.user.id;
        
        this.isReady = true;
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
