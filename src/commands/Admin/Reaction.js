const Command = require('../../core/classes/Command');

class Reaction extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'reaction';
        this.group        = 'Admin';
        this.aliases      = [ ];
        this.description  = 'Set booster reaction!';
        this.usage        = 'reaction (user) (clear/emoji) (word)';
        this.expectedArgs = 2;
        this.cooldown     = 5000;
        this.permissions = 'admin'

        this.boostConfig = this.config.boostReactionSettings
    }
    
    async execute({ message, args }) {
        let isClear = args[1] && args[1] == "clear";
        let emoji = this.utils.emojiRegex.test(args[1]) ? args[1] : undefined;

        let user = this.resolveUser(message.guild, args[0]);
        if(!user) return this.error(message.channel, "No valid user detected!")

        if(!emoji && !isClear) {
            let {isValid, id} = this.validateCustomEmoji(args[1]);
            if(!isValid) return this.error(message.channel, "No emoji found!")
            let getEmoji = this.client.emojis.cache.get(id);
            if(getEmoji) {emoji = args[1]}
        }
        let word = args[2];

        if(!user.roles.cache.get(this.boostConfig.boosterRole)) return this.error(message.channel, "User must be a 3x booster!")

        if(isClear) {
            this.global.boostReact.clearEmoji(user.id);

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

            this.global.boostReact.addEmoji(user.id, emoji, word);

            let embed = {
                title: `The bot will now react ${emoji} to ${word}`
            }

            return this.sendMessage(message.channel, {embed}, {replyTo: message})
        }
    }
    
}

module.exports = Reaction;
