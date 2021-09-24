const logger = require('../logger');
const utils  = require('../utils');
const config = require('../config');
const db = require('../database');
const Discord = require('discord.js');
const _ = require('lodash');

class Base {
    constructor(global) {
        this._global = global;
    }
    
    get global() {
        return this._global;
    }
    
    get client() {
        return this.global._client;
    }
    
    get db() {
        return db;
    }
    
    get models() {
        return this.db.models;
    }
    
    get config() {
        return config;
    }
    
    get logger() {
        const _logger = _.cloneDeep(logger.get(this.constructor.name));
        const _logWebhook = this.logWebhook.bind(this);
        
        const overrideHandler = {
            get: function(target, prop) {
                function overrideLogger(method, webhook) {
                    webhook = webhook || `${method}s`;
                    
                    if (!config.webhooks.has(webhook)) {
                        return target[prop];
                    }
                    
                    return function (log, uniqueMarker, extra) {
                        _logWebhook(null, null, {
                            webhook,
                            username: `Logger - ${method}`,
                            text: log,
                            suppress: true
                        });
                        
                        return target[method](log, uniqueMarker, extra);
                    }
                }
                
                const overrides = [ 'error', 'warn', 'info', 'debug', 'trace' ];
                for (const override of overrides) {
                    if (prop == override) {
                        return overrideLogger(override);
                    }
                }
                
                return target[prop]
            }
        };
        
        return new Proxy(_logger, overrideHandler);
    }
    
    get utils() {
        return utils;
    }
    
    get Discord() {
        return Discord;
    }
    
    logWebhook(title, fields, options) {
        options = options || {};
        
        if (!options.avatar && (this?.global && this?.global?.isReady)) {
            options.avatar = `https://cdn.discordapp.com/avatars/${this.global.user.id}/${this.global.user.avatar}.png`;
        }
        
        if (!options.suppress) {
            if (typeof this.logger[options.logMethod] == 'function') {
                this.logger[options.logMethod](title, options.uniqueMarker);
            } else {
                this.logger.info(title, options.uniqueMarker);
            }
        }
        
        if (!this.config.webhooks.has(options.webhook)) {
            return this.logger.warn(`Invalid webhook ${options.webhook}`, 'postWebhook');
        }
        
        const webhookUrl = this.config.webhooks.get(options.webhook);
        const logPingRole = this.config.webhooks.get('logPingRole');
        const username = options.username || 'Global Bot';
        
        const payload = {
            username,
            avatarURL: options.avatar,
            content: '',
            embeds: [],
            tts: false,
        };
        
        const embed = {
            title: title,
            timestamp: new Date(),
            footer: {
                text: 'GlobalBot'
            }
        };
        
        if (options.text) {
            embed.description = options.text;
        }
        
        if (fields) embed.fields = fields;
        
        payload.embeds.push(embed);
        payload.content += `<@&${logPingRole}>`;
        
        this.postWebhook(webhookUrl, payload)
        .catch(err => this.logger.error(err, 'postWebhook'));
    }
    
    executeWebhook(id, token, url, payload) {
        return new this.Discord.WebhookClient({ id, token, url }).send(payload);
    }
    
    postWebhook(webhook, payload) {
        const [ id, token ] = webhook.split('/').slice(-2);
        return this.executeWebhook(id, token, webhook, payload);
    }
    
    isAdmin(user) {
        return this.global.permissions.isAdmin(user);
    }
    
    isServerAdmin(member, channel) {
        return this.global.permissions.isServerAdmin(member, channel)
    }
    
    isServerMod(member, channel) {
        return this.global.permissions.isServerMod(member, channel)
    }
    
    get sendMessage() {
        return this.utils.sendMessage;
    }

    get firstUpperCase() {
        return this.utils.firstUppercase;
    }
    
    reply(message, content, options) {
        return this.sendMessage(message.channel, `${message.author.mention}, ${content}`, options);
    }
    
    success(channel, content, options) {
        const embed = {
            color: 'GREEN',
            description: `${this.config.emojis.get('success')} ${content}`
        };
        
        return this.sendMessage(channel, { embed }, options);
    }
    
    error(channel, content, err) {
        const embed = {
            color: 'RED',
            description: `${this.config.emojis.get('error')} ${content}`
        };
        
        return new Promise((resolve, reject) => {
            return this.sendMessage(channel, { embed })
            .catch(e => e)
            .then(() => reject(err || content));
        });
    }
    
    get Resolver() {
        return this.utils.Resolver;
    }
    
    get resolveUser() {
        return this.Resolver.user;
    }
    
    get resolveRole() {
        return this.Resolver.role;
    }
    
    get resolveChannel() {
        return this.Resolver.channel;
    }
    
    createMessageCollector(channel,{filter, time = 60000, max = 0}) {
        if(!channel || !filter) return;
        return new Promise(res => {
            let messageCollector = channel.createMessageCollector({filter, time, max});
            
            messageCollector.on('end', collected => {
                return res(max == 1 ? collected[0] : collected);
            })
        })
    }

    createInteractionCollector(message,{filter, time = 60000, max = 0}) {
        if(!message || !filter) return;
        return new Promise(res => {
            let interactionCollector = message.createMessageComponentCollector({filter, time, max});
            
            interactionCollector.on('end', collected => {
                return res(max == 1 ? collected.first() : collected);
            })
        })
    }
}

module.exports = Base;
