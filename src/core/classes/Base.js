const logger = require('../logger');
const utils  = require('../utils');
const config = require('../config');
const db = require('../database');
const Discord = require('discord.js');
const _ = require('lodash');
const InteractionData = require('./InteractionData');
const { table } = require('table');


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
    
    get moment() {
        return require("moment")
    }

    get ms() {
        return require("ms");
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
                for(let item of collected.values()) {item.customId = this.cleanInteraction(item.customId); collected.set(item.id, item)}
                return res(max == 1 ? collected.first() : collected);
            })
        })
    }
    
    makeButton(name, user_id, cmd, emoji, type = "PRIMARY") {
        return new Discord.MessageButton()
        .setCustomId(`${cmd}-${name.toLowerCase()}-${user_id}`)
        .setLabel(name)
        .setStyle(type)
        .setEmoji(emoji ? emoji : undefined)
        .setDisabled(false);
    }
    
    cleanInteraction(id) {
        if(!id) return false;
        return id.split("-")[1];
    }
    
    customID(identifier, command) {
        let randomID         = '';
        let length           = 10;
        let characters       = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for (let i = 0; i < length; i++) {
            randomID += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        
        return [
            command,
            randomID,
            identifier
        ].join('-');
    }
    
    button(identifier, command, label, data = null, emoji, style = 'PRIMARY') {
        const customID = this.customID(identifier, command);
        this.setData(customID, data);
        
        return new Discord.MessageButton()
        .setCustomId(customID)
        .setLabel(label)
        .setEmoji(emoji)
        .setStyle(style);
    }

    validate(interaction) {
        if (!interaction) return false;
        if (!interaction.isButton()) return false;
        
        // Check the customID is legitimate and comes from the bot
        const customId = interaction.customId;
        if (!customId) return false;

        // Check the format of the customId and break it up into parts
        const idParts = customId.split('-');
        if (!idParts || idParts.length != 3) return false;

        return true;
    }

    async resolve(interaction) {
        if (!this.validate(interaction)) return null;

        if (!interaction) return;
        if (!interaction.isButton()) return;

        const customId = interaction.customId;
        
        // Check the format of the customId and break it up into parts
        const idParts = customId.split('-');
        const command = idParts[0];
        const interactionIdentifier = idParts[2];

        // Check if there is any saved data on the interaction customID
        let data = null;
        if (await this.hasData(customId)) {
            // Get the data if it's valid
            const interactionData = await this.getData(customId);
            if (interactionData) {
                data = interactionData;
            }
        }

        // Check if a button identifier was provided
        let identifier = null;
        if (interactionIdentifier) {
            identifier = interactionIdentifier;
        }

        return { interaction, identifier, data, command };
    }
    
    async getData(id) {
        const interactionData = new InteractionData(this, id);
        return await interactionData.get();
    }
    
    async hasData(id) {
        const interactionData = new InteractionData(this, id);
        return await interactionData.has();
    }
    
    async setData(id, data) {
        const interactionData = new InteractionData(this, id);
        return await interactionData.set(data);
    }

    table(data) {
        const tableConfig = {
            border: {
                topBody: `─`,
                topJoin: `┬`,
                topLeft: `┌`,
                topRight: `┐`,
                
                bottomBody: `─`,
                bottomJoin: `┴`,
                bottomLeft: `└`,
                bottomRight: `┘`,
                
                bodyLeft: `│`,
                bodyRight: `│`,
                bodyJoin: `│`,
                
                joinBody: `─`,
                joinLeft: `├`,
                joinRight: `┤`,
                joinJoin: `┼`
            }
        };

        return table(data, tableConfig);
    }

    codeBlock(content, language = '', options = {}) {
        let code = [ '```' + language, content, '```' ].join('\n');

        if (options.header) {
            code = `${options.header}\n${code}`;
        }
        
        if (options.footer) {
            code = `${code}\n${options.footer}`;
        }

        return code;
    }

    sendCode(channel, content, ...args) {
        const code = this.codeBlock(content, ...args);

        return this.sendMessage(channel, code);
    }

    clean(str) {
        const cleanRegex = new RegExp('([_\*`])', 'g');
		return str.replace(cleanRegex, '\\$&');
    }

    fullName(user, escape = true) {
        user = user.user || user;

        const discriminator = user.discriminator;
        let username = this.clean(user.username);

        if (escape) {
            username = username.replace(/\\/g, '\\\\').replace(/`/g, `\`${String.fromCharCode(8203)}`);
        }

		return `${username}#${discriminator}`;
    }
}

module.exports = Base;
