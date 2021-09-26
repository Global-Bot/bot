const Command = require('../../core/classes/Command');

class EightBall extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = '8ball';
        this.group        = 'Fun';
        this.aliases      = [ ];
        this.description  = 'Ask the magic 8 ball!';
        this.usage        = '8ball <message>';
        this.expectedArgs = 1;
        this.cooldown     = 5000;
    }

    async execute({ message, args }) {
        let response = this.config.eightball.answers.random();
        let query = args.join(" ")
        const embed = {
            title: "Magic 8 Ball says...",
            fields: [
                {
                    name: "Question",
                    value: query,
                },
                {
                    name: "Answer",
                    value: `**${response}**`,
                }
            ]
        }
        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = EightBall;
