const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Cuddle extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'cuddle';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Cuddle a user';
        this.usage        = 'cuddle [user]';
        this.expectedArgs = 1;
        this.cooldown     = 30000;

        this._gifs = actionGifs[this.name];
    }

    async execute({ message, args, guild }) {
        let user = this.resolveUser(guild, args[0]);
        if (!user || user == message.member) {
            if (user == message.member) {
                return this.error(message.channel, 'You cannot cuddle yourself lonely');
            }

            return this.error(message.channel, 'Failed to find that user');
        }

        let embed = {
            title: `${message.member.user.username} cuddled ${user.user.username}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Cuddle;
