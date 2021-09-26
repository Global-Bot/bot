// 

const Command = require('../../core/classes/Command');
const Fetcher = require('../../core/classes/Fetcher');

class Fact extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'fact';
        this.group        = 'Fun';
        this.aliases      = [ ];
        this.description  = 'Get a random fact!';
        this.usage        = 'daily';
        this.expectedArgs = 0;
        this.cooldown     = 10000;
        this.Facts        = new Fetcher("https://useless-facts.sameerkumar.website/api")
    }

    async execute({ message }) {
        let data = await this.Facts.fetch();
        let {data: fact} = data.data;
        const embed = {
            title: "Fun Fact",
            description: `**${fact}**`
        }
        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = Fact;
