const Command = require('../../core/classes/Command');

class Daily extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'daily';
        this.group        = 'Economy';
        this.aliases      = [ ];
        this.description  = 'Earn daily star bonus';
        this.usage        = 'daily';
        this.expectedArgs = 0;
        this.cooldown     = 60000 * 60 * 24;
    }

    async execute({ message }) {
        let economyData = await message.member.economy;

        let starAmount = this.config.economySettings.dailyBonus;

        economyData.add(starAmount);

        const embed = {
            title: "Daily Bonus Added",
            description: `You have received **${starAmount}** ${this.config.emojis.star}`,
            footer: {
                text: `You can run this command daily`
            }
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Daily;
