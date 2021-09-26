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
        if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        let starAmount = this.config.economySettings.weeklyBonus;
        let multiplier = this.calculateMultiplier(message.member);
        let starAfterMultiplier = Math.floor((starAmount * multiplier))
        let difference = starAfterMultiplier - starAmount;

        economyData.add(starAfterMultiplier);

        const embed = {
            title: "Weekly Bonus Added",
            description: `You have received **${starAfterMultiplier}** ${this.config.emojis.get("star")} ${multiplier > 1 ? `\nYou have received **${difference} bonus** ${this.config.emojis.get("star")} for boosting!`: "" }`,
            footer: {
                text: `You can run this command weekly`
            }
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Weekly;
