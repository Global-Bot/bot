const Command = require('../../core/classes/Command');
const actionGifs = require('./actionGifs.json');

class Hug extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'hug';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Hug a user';
        this.usage        = 'hug [user]';
        this.expectedArgs = 1;
        this.cooldown     = 30000;

        this._gifs = actionGifs[this.name];
    }

    async execute({ message, args, guild }) {
        let user = this.resolveUser(guild, args[0]);
        if (!user || user == message.member) {
            if (user == message.member) {
                return this.error(message.channel, 'You cannot hug yourself lonely');
            }

            return this.error(message.channel, 'Failed to find that user');
        }

        let embed = {
            title: `${this.fullName(message.member)} hugged ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Hug;
