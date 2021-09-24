const Command = require('../../core/classes/Command');
const randomInt = require('../../core/utils/randomInt');

class Ping extends Command {
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

        let starRange = this.config.economySettings.workStarRange;

        let starAmount = randomInt(starRange[0], starRange[1]);

        economyData.add(starAmount);

        const embed = {
            title: "Work Complete",
            description: `You have earned **${starAmount}** ${this.config.emojis.star}`,
            footer: {
                text: `You can work again in 20 minutes`
            }
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Ping;
