const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Wave extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'wave';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Wave a user';
        this.usage        = 'wave [user]';
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
            title: user == message.member ? `${this.fullName(user)} wove` : `${message.member.user.username} waved at ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Wave;
