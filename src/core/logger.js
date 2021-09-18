const { init, Logger } = require('@global-bot/logger');
const Discord = require('discord.js');
const config = require('./config');

init(config.logger);


const GlobalLogger = Object.assign(Logger, {
    logWebhook(title, fields, options) {
		options = options || {};

        if (!options.suppress) {
			this.get('webhookLog').info(title, options.uniqueMarker);
		}

        if (!config.webhooks.has(options.webhook)) {
            return this.get('postWebhook').warn(`Invalid webhook ${options.webhook}`);
        }

		const webhookUrl = config.webhooks.get(options.webhook);
		const username = options.username || 'Global Bot';

		const payload = {
            username,
            avatar_url: `${config.avatar}`,
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

        this.postWebhook(webhookUrl, payload)
            .catch(err => this.get('postWebhook').error(err));
	},
    
    executeWebhook(id, token, url, payload) {
        return new Discord.WebhookClient({ id, token, url }).send(payload);
    },

    postWebhook(webhook, payload) {
		const [ id, token ] = webhook.split('/').slice(-2);
		return this.executeWebhook(id, token, webhook, payload);
	}
})


module.exports = GlobalLogger;
