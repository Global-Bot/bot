const Command = require('../../core/classes/Command');

class WYR extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'wouldyourather';
        this.group        = 'Fun';
        this.aliases      = [ "wyr" ];
        this.description  = 'Would you rather..?';
        this.usage        = 'wyr'
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        let question = this.config.wyr.questions.random();
        const embed = {
            title: question
        }
        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = WYR;
