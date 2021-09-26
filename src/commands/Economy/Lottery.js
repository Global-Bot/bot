const { MessageActionRow } = require('discord.js');
const Command = require('../../core/classes/Command');

class Daily extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'lottery';
        this.group        = 'Economy';
        this.aliases      = [ ];
        this.description  = 'View or enter the lottery!';
        this.usage        = 'lottery (buy) (tickets)';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }
    
    surroundText(text) {
        return `\`\`\`\n${text}\n\`\`\``
    }
    
    async execute({ message, args }) {
        let quantity = parseInt(args[1]) || 1;
        let isBuy = args[0] && args[0] == "buy";

        if(quantity && (isNaN(quantity) || quantity < 0)) return this.error(message.channel, "Invalid amount!")
        
        if(isBuy && quantity) {
            let economyData = await message.member.economy;
            if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

            let ticketPrice = this.config.lottery.ticketPrice;
            let userPurchasePrice = quantity * ticketPrice;
            
            if(userPurchasePrice  > economyData.stars) return this.error(message.channel, "Insufficient funds!")

            let row = new MessageActionRow().addComponents([this.makeButton({name: "Confirm", user_id: message.author.id, type: "SUCCESS"}), this.makeButton({name: "Cancel", user_id: message.author.id, type: "DANGER"})])

            let embed = {
                title: `Please confirm that you would like to purchase \`${quantity}\` lottery ticket(s) for \`${userPurchasePrice}\` ${this.config.emojis.get("star")}`
            }

            let msg = await this.sendMessage(message.channel, {embed, components: [row]});
            const filter = int => int.user.id == message.author.id;
            let getColletedData = await this.createInteractionCollector(msg, {filter, max: 1})
            msg.delete();
            
            if(!getColletedData || getColletedData.customId == "cancel") {
                embed = {
                    title: "Command Cancelled"
                }
                return this.sendMessage(message.channel, {embed})
            }

            let confirmFundsRemoved = economyData.remove(userPurchasePrice);
            if(!confirmFundsRemoved) return this.error(message.channel, "Insufficient Balance!");

            this.global.lottery.addTickets(message.author.id, quantity);

            embed = {
                title: "Purchase Complete"
            }

            return this.sendMessage(message.channel, {embed});

        } else {
            let {totalTickets, totalJackpot, userTickets} = await this.global.lottery.getStats(message.author.id);
            const embed = {
                title: `${this.fullName(message.member)}'s Lottery Stats`,
                thumbnail: {
                    url: message.guild.iconURL()
                },
                fields: [
                    {
                        name: "Current Jackpot",
                        value: this.surroundText(`${totalJackpot}⭐`)
                    },
                    {
                        name: "Your Tickets",
                        value: this.surroundText(userTickets),
                        inline: true
                    },
                    {
                        name: "Total Tickets",
                        value: this.surroundText(totalTickets),
                        inline: true
                    },
                    {
                        name: "Time Left",
                        value: this.surroundText(this.ms(this.global.lottery.calculateTime(), {long: true})),
                    }
                ]
            }

            return this.sendMessage(message.channel, {embed})
        }
    }
    
}

module.exports = Daily;
