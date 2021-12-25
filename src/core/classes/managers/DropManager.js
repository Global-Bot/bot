const { MessageActionRow } = require("discord.js");
const Base = require("../Base");

class DropManager extends Base {
    constructor(global) {
        super(global);
        
        this._count = 0;
        this._lastUser = "";
        this.settings = this.config.dropSettings;
        this.chanceOfDrop = this.settings.chanceOfDrop;
        this.starRange = this.settings.starRange;
        this.failButtonChance = this.settings.chanceOfFailButton
        this.messagesPerDrop = this.settings.messagesPerDrop

        this.failEmoji = "❌"
        this.starEmoji = this.config.emojis.get("star");
    }

    makeButton({name, user_id, emoji, type}) {
        return super.makeButton(name || "", user_id, this.name, emoji, type)
    }
    
    generateStarAmount() {
        return this.randomInt(this.starRange[0], this.starRange[1])
    }

    get buttons() {
        let buttons = [this.makeButton({emoji: this.starEmoji, type: "SECONDARY"})]
        let randInt = this.randomInt(0, 100);
        randInt < this.failButtonChance ? buttons = [this.makeButton({name: this.failEmoji, type: "SECONDARY"})].concat(buttons) : false;
        return new MessageActionRow().addComponents(buttons);
    }
    
    async calculateMessage(message) {
        if(message.author.id == this._lastUser) return;

        this._count = ++this._count;
        this._lastUser = message.author.id;

        if(this._count > this.messagesPerDrop) {
            let randomNumber = this.randomInt(1, 100)
            let loseStars = this.randomInt(1, 10) > 5 ? false : true;

            if(randomNumber > this.chanceOfDrop) return;
            this._count = 0;
            
            let starAmount = this.generateStarAmount();
            
            const embed = {
                title: "Star Drop!",
                description: `React now for the chance to ${loseStars ? "lose" : "win"} **${starAmount} ${this.starEmoji}**!`
            }
            
            let row = this.buttons;
            let starMessage = await this.sendMessage(message.channel, {embed, components: [row]});
            let getFirst = await this.createInteractionCollector(starMessage, {time: 5000, max: 1});

            starMessage.delete();

            if(!getFirst) return;
            if(getFirst.customId == this.failEmoji) {loseStars = true}

            let getMember = await message.guild.members.fetch(getFirst.user.id).catch(() => {})
            if(!getMember) return;

            let economyProfile = await getMember.economy;
            let getMultiplier = await this.calculateMultiplier(getMember);
            !loseStars ? starAmount = starAmount * getMultiplier : starAmount;

            loseStars ? economyProfile.remove(starAmount) : economyProfile.add(starAmount);
            return message.channel.send(`${getMember.toString()} ${loseStars ? "lost" : "earned"} **${starAmount} ${this.starEmoji}**!`);
        }
        return;
    }
}

module.exports = DropManager;
