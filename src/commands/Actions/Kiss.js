const Command = require('../../core/classes/Command');
const actionGifs = require('../../assets/actionGifs.json');

class Kiss extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'kiss';
        this.group        = 'Actions';
        this.aliases      = [];
        this.description  = 'Kiss a user';
        this.usage        = 'kiss <user>';
        this.expectedArgs = 1;
        this.cooldown     = 30000;

        this._gifs = actionGifs[this.name];
    }

    async execute({ message, args, guild }) {
        let user = this.resolveUser(guild, args[0]);
        if (!user || user == message.member) {
            if (user == message.member) {
                return this.error(message.channel, 'You cannot kiss yourself lonely');
            }

            return this.error(message.channel, 'Failed to find that user');
        }

        let embed = {
            title: `${this.fullName(message.member)} kissed ${this.fullName(user)}`,
            image: { url: this._gifs.random() }
        }

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Kiss;
