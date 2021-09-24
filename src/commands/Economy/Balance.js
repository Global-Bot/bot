const Command = require('../../core/classes/Command');

class Balance extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'balance';
        this.group        = 'Economy';
        this.aliases      = [ 'bal' ];
        this.description  = 'Returns user balance';
        this.usage        = 'balance (user)';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message, args }) {
        let userGet = this.resolveUser(message.guild, args[0]) || message.member;
        let economyData = await userGet.economy;

        if(economyData.errored) return this.sendMessage(message.channel, "A system error has occured");

        const embed = {
            title: `${userGet.user.username} - Balance`,
            description: `**${economyData.stars}** ${this.config.emojis.star}`,
            thumbnail: {
                url: userGet.user.avatarURL()
            }
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Balance;
