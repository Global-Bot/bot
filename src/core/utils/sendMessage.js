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
        message.embeds = [ message.embed ];
        delete message.embed;
    }

    return channel.send(message).then(msg => {
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

module.exports = sendMessage;