const Command = require('../../core/classes/Command');

class Topic extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'topic';
        this.group        = 'Fun';
        this.aliases      = [ ];
        this.description  = 'Generate a random topic';
        this.usage        = 'topic'
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        let question = this.config.topics.questions.random();
        const embed = {
            title: question
        }
        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Topic;