const Command = require('../../core/classes/Command');

class Reaction extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'reaction';
        this.group        = 'Booster';
        this.aliases      = [ ];
        this.description  = 'Set booster reaction!';
        this.usage        = 'reaction (clear/emoji) (word)';
        this.expectedArgs = 1;
        this.cooldown     = 5000;

        this.boostConfig = this.config.boostReactionSettings
    }
    
    async execute({ message, args }) {
        let isClear = args[0] && args[0] == "clear";
        let emoji = this.utils.emojiRegex.test(args[0]) ? args[0] : undefined;
        if(!emoji && !isClear) {
            let {isValid, id} = this.validateCustomEmoji(args[0]);
            if(!isValid) return;
            let getEmoji = this.client.emojis.cache.get(id);
            if(getEmoji) {emoji = args[0]}
        }
        let word = args[1];

        if(!message.member.roles.cache.get(this.boostConfig.boosterRole)) return this.error(message.channel, "You must be a 3x booster!")

        if(isClear) {
            this.global.boostReact.clearEmoji(message.author.id);

            let embed = {
                title: "Emoji Deleted"
            }

            return this.sendMessage(message.channel, {embed}, {replyTo: message});

        } else {
            if(!emoji) return this.error(message.channel, "No emoji detected!")
            if(!word) return this.error(message.channel, "No word provided!")
            if(word.length < this.boostConfig.minChars) return this.error(message.channel, "Word too short!")
            if(word.length > this.boostConfig.maxChars) return this.error(message.channel, "Word too long!")

            let checkExists = await this.global.boostReact.includesEmojiTrigger(word);
            if(checkExists) return this.error(message.channel, "Word unavailable!")

            this.global.boostReact.addEmoji(message.author.id, emoji, word);

            let embed = {
                title: `The bot will now react ${emoji} to ${word}`
            }

            return this.sendMessage(message.channel, {embed}, {replyTo: message})
        }
    }
    
}

module.exports = Reaction;
