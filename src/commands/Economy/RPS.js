const { MessageButton, MessageActionRow } = require('discord.js');
const Command = require('../../core/classes/Command');
const expandedSideChoices = ["rock", "paper", "scissors"]

class RPS extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'rps';
        this.group        = 'Economy';
        this.aliases      = [];
        this.description  = 'Play rock paper scissors against a user or the bot';
        this.usage        = 'rps <bet> (user)';
        this.expectedArgs = 1;
        this.cooldown     = 5000;
    }
    
    emojis(user_id) {
        return new MessageActionRow().addComponents([this.makeButton({name: "Rock", user_id, emoji: "🪨"}), this.makeButton({name: "Paper", user_id, emoji: "📰"}), this.makeButton({name: "Scissors", user_id, emoji: "✂️"})])
    }  
    
    decisionEmbed(choice) {
        return {
            title: `You have chosen ${choice}!`,
            color: 'PURPLE'
        }
    }
    
    makeDecision(member) {
        return {
            title: `${member.user.username} - Make your decision`,
            color: "PURPLE"
        }
    }
    
    async getRPSInput(message, user, noReply) {
        let filter = interaction => interaction.user.id == user.id;
        let userInteractions = await this.createInteractionCollector(message, {filter, max: 1});
        if(!userInteractions) return false;
        let userChoice = userInteractions?.customId || expandedSideChoices.random();
        if(!noReply) {userInteractions.reply({embeds: [this.decisionEmbed(userInteractions.customId)], ephemeral: true})}
        return userChoice || false;
    }
    
    calculateWinner(userInput, targetInput) {
        if(userInput == 'rock' && targetInput !== 'paper') return userInput;
        if(userInput == 'paper' && targetInput !== 'scissors') return userInput;
        if(userInput == 'scissors' && targetInput !== 'rock') return userInput;
        return targetInput;
    }
    
    async execute({ message, args }) {
        let mentionedUser = this.resolveUser(message.guild, args[1])
        let bet = parseInt(args[0])
        
        let economyData = await message.member.economy;
        let userEconomyData = mentionedUser ? await mentionedUser.economy : undefined;
        
        if(economyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");
        
        if(isNaN(bet) || bet <= 0) return this.error(message.channel, "Invalid bet!")
        if(bet > economyData.stars) return this.error(message.channel, "Insufficient funds!")
        if(userEconomyData && userEconomyData.stars < bet) return this.error(message.channel, "Insufficient funds!")
        if(mentionedUser && mentionedUser == message.author.id) return this.error(message.channel, "You cannot RPS against yourself!")
        
        let embed = this.makeDecision(message.member)
        let msg = await this.sendMessage(message.channel, {embed, components: [this.emojis(message.author.id)]})
        
        if(mentionedUser) {
            if(userEconomyData.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");
            
            let userChoice = await this.getRPSInput(msg, message.member);
            if(!userChoice) {msg.delete(); return this.error(message.channel, "No user input provided, command cancelled.")}
            msg.edit({embeds: [this.makeDecision(mentionedUser)], ephemeral: true})
            
            let targetChoice = await this.getRPSInput(msg, mentionedUser);
            if(!targetChoice) {msg.delete(); return this.error(message.channel, "No user input provided, command cancelled.")}
            
            msg.delete();
            
            let removeMemberBet = economyData.remove(bet);
            let removeUserBet = userEconomyData.remove(bet);
            if(!removeMemberBet || !removeUserBet) return this.error(message.channel, "Insufficient funds!")
            
            
            let getWinner = this.calculateWinner(userChoice, targetChoice);
            let winnerData = getWinner == userChoice ? {user: message.member, economy: economyData} : {user: mentionedUser, economy: userEconomyData};
            let isDraw = userChoice == targetChoice;
            
            winnerData.economy.add(isDraw ? bet : bet * 2);
            
            embed = {
                title: `${isDraw ? "Draw!" : `${winnerData.user.user.username} has won!`}`,
                description: `**${message.member.toString()} chose**: ${this.firstUpperCase(userChoice)}\n**${mentionedUser.toString()} chose**: ${this.firstUpperCase(targetChoice)}`,
            }
            
        } else {
            let userChoice = await this.getRPSInput(msg, message.member, true);
            if(!userChoice) {msg.delete(); return this.error(message.channel, "No user input provided, command cancelled.")}
            msg.delete();
            economyData.remove(bet);
            
            let botChoice = expandedSideChoices.random();
            
            let calcWinner = this.calculateWinner(userChoice, botChoice);
            let userWon = calcWinner == userChoice ? true : false
            let isDraw = userChoice == botChoice;
            
            if(userWon) {
                economyData.add(isDraw ? bet : bet * 2)
            }
            
            embed = {
                title: `${isDraw ? "Draw!" : userWon ? "Congratulations!" : "Bad Luck!"}`,
                description: `**You chose**: ${this.firstUpperCase(userChoice)}\n**Bot chose**: ${this.firstUpperCase(botChoice)}`,
            }
        }
        return this.sendMessage(message.channel, {embed})
        
    }
    
}

module.exports = RPS;
