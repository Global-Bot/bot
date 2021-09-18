const config = require('../config');

function isWebhook(message) {
    for (const webhook of config.webhooks.values()) {
		const [ id ] = webhook.split('/').slice(-2);
        
        if (message.author.id == id) return true;
    }

    return false
}

module.exports = isWebhook;
