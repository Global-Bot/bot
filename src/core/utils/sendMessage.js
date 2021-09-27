const config = require('../config');

function sendMessage(channel, message, options) {
    options = options || {};
    if (!channel || !message) {
        return Promise.resolve();
    }

    if (Array.isArray(message)) {
        message = message.join('\n');
    }

    message = typeof message == 'string' ? { content: message, disableEveryone: true } : message;
    message.disableEveryone = options.disableEveryone != undefined ? options.disableEveryone : true;

    if (message.embed) {
        message.embed.title = `[${config.stateName}] ${message.embed.title || ""}`
        if (!message.embed.color) message.embed.color = 'PURPLE';
        
        message.embeds = [ message.embed ];
        delete message.embed;
    }

    return send(Array.from(arguments)).then(msg => {
        if (options.pin) {
            msg.pin();
        }

        if (options.deleteAfter) {
            setTimeout(() => {
                msg.delete().catch(() => true);
            }, options.deleteAfter);
        }

        return msg;
    }).catch(err => err)
}

async function send(args) {
    let [channel,message,options] = args;
    options = options || {};
    let msg = options.replyTo ? await options.replyTo.reply(message) : await channel.send(message)
    return msg;
}

module.exports = sendMessage;
