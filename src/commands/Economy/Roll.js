const Command = require('../../core/classes/Command');
const randomInt = require('../../core/utils/randomInt');

class Roll extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'roll';
        this.group        = 'Economy';
        this.aliases      = [];
        this.description  = 'Roll a random number and multiply your stars!';
        this.usage        = 'roll <bet>';
        this.expectedArgs = 1;
        this.cooldown     = 5000;
    }

    async execute({ message, args }) {
        let economyData = await message.member.economy;
        if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        let bet = parseInt(args[0]);

        let lowestBet = this.config.economySettings.rollLowestBet

        if(isNaN(bet) || bet < 0) return this.error(message.channel, "Invalid bet!")
        if(bet < lowestBet) return this.error(message.channel, `Bet must be higher than ${lowestBet}!`)
        if(bet > economyData.stars) return this.error(message.channel, "Insufficient funds!")

        economyData.remove(bet);

        let rollTable = this.config.rollMultipliers;
        let randomNumber = this.utils.randomInt(1, 100)
        
        let multiplier;

        for(let key in rollTable) {if(randomNumber > key) {multiplier = rollTable[key]}}

        let winnings = Math.floor(bet * multiplier);

        economyData.add(winnings)

        let embed = {
            title: `${multiplier ? "Congratulations" : "Hard luck!"}`,
            description: `${message.author.tag}, **\`You rolled ${randomNumber}\`**. ${winnings ? `Congrats, You've won **${winnings}** ${this.config.emojis.get("star")}` : ""}`
        }

        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }

}

module.exports = Roll;
