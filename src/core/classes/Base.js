const logger = require('../logger');
const utils  = require('../utils');
const config = require('../config');
const db = require('../database');
const Discord = require('discord.js');

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
        return logger.get(this.constructor.name)
    }

    get utils() {
        return utils;
    }

    get Discord() {
        return Discord;
    }

    logWebhook(title, fields, options) {
		options = options || {};

        if (!options.suppress) {
            if (Object.hasOwnProperty.call(this.logger, options.logMethod) && typeof this.logger[options.logMethod] == 'function') {
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
            avatar_url: `${this.config.avatar}`,
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
}

module.exports = Base;
