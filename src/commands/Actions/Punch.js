const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Punch extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'punch';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Punch a user';
        this.usage        = 'punch [user]';
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
            title: user == message.member ? `${this.fullName(user)} punched themself... that must of hurt` : `${message.member.user.username} punched ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Punch;
