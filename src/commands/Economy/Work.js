const Command = require('../../core/classes/Command');
const randomInt = require('../../core/utils/randomInt');

class Work extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'work';
        this.group        = 'Economy';
        this.aliases      = [ ];
        this.description  = 'Earn stars by working';
        this.usage        = 'work';
        this.expectedArgs = 0;
        this.cooldown     = 60000 * 20;
    }

    async execute({ message }) {
        let economyData = await message.member.economy;
        if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        let starRange = this.config.economySettings.workStarRange;

        let starAmount = randomInt(starRange[0], starRange[1]);

        let multiplier = this.calculateMultiplier(message.member);
        let starAfterMultiplier = Math.floor((starAmount * multiplier))
        let difference = starAfterMultiplier - starAmount;

        economyData.add(starAfterMultiplier);

        const embed = {
            title: "Work Complete",
            description: `You have earned **${starAfterMultiplier}** ${this.config.emojis.get("star")} ${multiplier > 1 ? `\nYou have received **${difference} bonus** ${this.config.emojis.get("star")} for boosting!`: "" }`,
            footer: {
                text: `You can work again in 20 minutes`
            }
        }

        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = Work;
