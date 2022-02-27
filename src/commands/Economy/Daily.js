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
        this.cooldown     = this.global.cooldown.CONSTANTS.DAILY;
    }

    async execute({ message }) {
        let economyData = await message.member.economy;
        if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        let starAmount = this.config.economySettings.dailyBonus;
        let multiplier = await this.calculateMultiplier(message.member);
        let starAfterMultiplier = Math.floor((starAmount * multiplier))
        let difference = starAfterMultiplier - starAmount;

        economyData.add(starAfterMultiplier);

        const embed = {
            title: "Daily Bonus Added",
            description: `You have received **${starAfterMultiplier}** ${this.config.emojis.get("star")} ${multiplier > 1 ? `\nYou have received **${difference} bonus** ${this.config.emojis.get("star")} for boosting!`: "" }`,
            footer: {
                text: `You can run this command daily`
            }
        }

        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = Daily;
