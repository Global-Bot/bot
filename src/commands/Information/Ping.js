const Command = require('../../core/classes/Command');

class Ping extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'ping';
        this.group        = 'Information';
        this.aliases      = [ 'pong' ];
        this.description  = 'Returns the ping of the bot';
        this.usage        = 'ping';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        const start = Date.now();

        return this.sendMessage(message.channel, 'Pong')
        .then(msg => {
            const ping = Date.now() - start; 
            return msg.edit(`${msg.content} - \`${ping}ms\``)
        })
    }

}

module.exports = Ping;
