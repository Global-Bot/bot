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
const ShopManager = require('./classes/managers/ShopManager');
const axios = require('axios');


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
        global.globalEvents = new EventEmitter();
        global.XPCooldowns = new Map();
        global.client = this.client;

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
        this.shop = new ShopManager(this);
        
        this.client.once('ready', this.ready.bind(this));
        this.client.on('messageUpdate', (_, newMessage) => {
            this.client.emit('messageCreate', newMessage)
        })

        this.login();
    }

    cacheMembers() {
        for (const [ _, guild ] of this.client.guilds.cache) {
            guild.members.fetch()
            .catch(this.logger.error);
        }
    }

    async ready() {
		this.logger.info(`[${this.config.stateName}] ${this.config.name} ready with ${this.client.guilds.cache.size} guilds`);
        this.client.guilds.cache.map(guild => this.logger.trace('\tGuild: ' + guild.name));
        
        this.dispatcher.bindListeners();
        
        this.cacheMembers();

        this.user = this._client.user;
        this.userID = this._client.user.id;

        this.countryData = await axios.get(this.config.levelling.CountryAPI)
        .then(res => res.data.map(country => ({ name: country.name.common, flag: country.flags.png, code: country.cca2 })));

        for (const [type, items] of Object.entries(this.config.shopDefaults))
        {
            const model = this.models[type];
            if (!model) throw new Error(`${type} is not a valid item type`);

            for (const item of items)
            {
                const requiredLevel = item.requiredLevel || 0 + 0;
                
                if (!await model.findOne({ where: { id: item.id } }))
                {
                    if (Object.hasOwnProperty.call(item, "requiredLevel"))
                    {
                        delete item.requiredLevel;
                    }
                    await model.create(item)
                }

                if (!await this.models.shop.findOne({ where: { itemID: item.id, type } }))
                {
                    await this.models.shop.create({ itemID: item.id, type, requiredLevel });
                }
            }
            
        }
        
        this.isReady = true;
    }

    login() {
        this.client.login(this.config.token);
        
        return true;
    }

    handleRejection(reason, p) {
        const log = `Unhandled rejection at: Promise ${require('util').inspect(p)} reason: ${reason}`;
        this.logger.error(log, 'unhandledRejection');
        
        this.logWebhook(`Rejection Error`, null, {
            webhook: 'rejections',
            username: 'Rejection Error',
            text: log,
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
