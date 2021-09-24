const Command = require('../../core/classes/Command');
const randomInt = require('../../core/utils/randomInt');
const sideChoices = ["h", "t"];
const expandedSideChoices = ["heads", "tails"]

class Coinflip extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'coinflip';
        this.group        = 'Economy';
        this.aliases      = ["cf"];
        this.description  = 'Coinflip your stars';
        this.usage        = 'coinflip <h/t> <bet>';
        this.expectedArgs = 2;
        this.cooldown     = 5000;
    }

    async execute({ message, args }) {
        let economyData = await message.member.economy;

        let sideChoice = args[0];
        if(!sideChoices.includes(sideChoice)) return this.sendMessage(message.channel, "You must pick **h/t**")

        let bet = parseInt(args[1]);

        if(isNaN(bet) || bet < 0) return this.sendMessage(message.channel, "Invalid bet!")
        if(bet > economyData.stars) return this.sendMessage(message.channel, "Insufficient funds!")

        economyData.remove(bet);

        let winChance = this.config.economySettings.coinflipWinningPercentage;

        let botChoice = expandedSideChoices[sideChoices.indexOf(sideChoice) == 1 ? 0 : 1]

        let hasWon = randomInt(1, 100) < winChance ? true : false;

        if(hasWon) {economyData.add(bet * 2)}

        const embed = {
            title: "CoinFlip",
            description: `Coin lands on **${botChoice}**\nYou have ${hasWon ? "won" : "lost"} **${bet}** ${this.config.emojis.star}`
        }

        return this.sendMessage(message.channel, {embed})
    }

}

module.exports = Coinflip;
