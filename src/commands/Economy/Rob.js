const Command = require('../../core/classes/Command');
const ChancePkg = require("chance")
const Chance = new ChancePkg();

class Rob extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'rob';
        this.group        = 'Economy';
        this.aliases      = [];
        this.description  = 'Rob another user';
        this.usage        = 'rob (user) (amount)';
        this.expectedArgs = 2;
        this.cooldown     = 60000 * 10;
    }
    
    async execute({ message, args }) {
        let getUser = this.resolveUser(message.guild, args[0]);
        if(!getUser) return this.error(message.channel, "No valid user found")
        if(getUser.id == message.author.id) return this.error(message.channel, "You cannot rob yourself!")
        
        let targetEconomyData = await getUser.economy;
        let userEconomyData = await message.member.economy;
        if(targetEconomyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");
        if(userEconomyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        let robAmount = parseInt(args[1]);
        
        if(isNaN(robAmount) || robAmount <= 0) return this.error(message.channel, "Invalid bet!")
        if(robAmount > targetEconomyData.stars) return this.error(message.channel, "The user you are trying to rob has insufficient funds!") 
        if(robAmount > userEconomyData.stars) return this.error(message.channel, "You don't have enough stars!") 
        
        userEconomyData.remove(robAmount);
        
        let calculatedFloat = ((1 - (robAmount/targetEconomyData.stars)))
        let winUnderNumber = calculatedFloat > 0.6 ? 0.6 : calculatedFloat < 0.01 ? 0.01 : calculatedFloat;
        let randomFloatNumber = Chance.floating({min: 0, max: 1})
        let isSuccessful = randomFloatNumber < winUnderNumber ? true : false;
        
        
        
        if(isSuccessful) {
            userEconomyData.add(robAmount * 2);
            targetEconomyData.remove(robAmount)
        } else {
            targetEconomyData.add(robAmount)
        }
        
        const embed = {
            title: "Robbery Overview",
            description: `You have ${isSuccessful ? "successfully" : "unsuccessfully"} robbed ${getUser.toString()} and have ${isSuccessful ? "won" : "lost"} ${robAmount} ${this.config.emojis.get("star")}`,
            color: isSuccessful ? "00ff00" : "ff0000",
            footer: {
                text: `Chance: ${winUnderNumber}\nTicket: ${randomFloatNumber}`
            }
        }
        
        return this.sendMessage(message.channel, {embed}, {replyTo: message})
    }
    
}

module.exports = Rob;
