const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Poke extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'poke';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Poke a user';
        this.usage        = 'poke [user]';
        this.expectedArgs = 1;
        this.cooldown     = 30000;

        this._gifs = actionGifs[this.name];
    }

    async execute({ message, args, guild }) {
        let user = this.resolveUser(guild, args[0]);
        if (!user || user == message.member) {
            if (user == message.member) {
                return this.error(message.channel, 'You cannot poke yourself');
            }

            return this.error(message.channel, 'Failed to find that user');
        }

        let embed = {
            title: `${this.fullName(message.member)} poked ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Poke;
