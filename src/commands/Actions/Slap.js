const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Slap extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'slap';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Slap a user';
        this.usage        = 'slap [user]';
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
            title: user == message.member ? `${this.fullName(user)} slapped themself... that must of hurt` : `${this.fullName(message.member)} slapped ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Slap;
