const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Kill extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'kill';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Kill a user';
        this.usage        = 'kill [user]';
        this.expectedArgs = 0;
        this.cooldown     = 30000;

        this._gifs = actionGifs[this.name];
    }

    async execute({ message, args, guild }) {
        let user = this.resolveUser(guild, args[0]) || message.member;
        if (!user) {
            return this.error(message.channel, 'Failed to find that user');
        }

        let embed = {
            title: user == message.member ? `${user.user.username} killed themself` : `${message.member.user.username} killed ${user.user.username}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Kill;
