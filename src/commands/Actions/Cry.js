const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Cry extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'cry';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Cry on a user';
        this.usage        = 'cry [user]';
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
            title: user == message.member ? `${user.user.username} cried` : `${message.member.user.username} cried on ${user.user.username}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Cry;
