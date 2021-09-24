const Command = require('../../core/classes/Command');

class Weekly extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'weekly';
        this.group        = 'Economy';
        this.aliases      = [ ];
        this.description  = 'Earn weekly star bonus';
        this.usage        = 'weekly';
        this.expectedArgs = 0;
        this.cooldown     = 60000 * 60 * 24 * 7;
    }

    async execute({ message }) {
        let economyData = await message.member.economy;
        if(economyData.errored) return this.sendMessage(message.channel, "A system error has occured");

        let starAmount = this.config.economySettings.weeklyBonus;

        economyData.add(starAmount);

        const embed = {
            title: "Weekly Bonus Added",
            description: `You have received **${starAmount}** ${this.config.emojis.star}`,
            footer: {
                text: `You can run this command weekly`
            }
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Weekly;
