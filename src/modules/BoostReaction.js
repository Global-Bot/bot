const Module = require('../core/classes/Module');

class BoostReaction extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'BoostReaction';
        this.description = 'Works with the BoostReactionManager';
        this.core        = true;
        this.enabled     = true;

        this.boosterRole = this.config.boostReactionSettings.boosterRole;
    }

    static get name() {
        return 'BoostReaction';
    }
    
    async messageCreate(event) {
        const { message, guild } = event;
        if (!message || message.author.bot || !guild) return;

        let getUserBoostEmoji = await this.global.boostReact.includesEmojiTrigger(message.content);
        if(getUserBoostEmoji) {
            message.react(getUserBoostEmoji)
        }
    }
    
    guildMemberUpdate(oldMember, newMember) {
        let boosterRoleRemoved = (oldMember.roles.cache.get(this.boosterRole) && !newMember.roles.cache.get(this.boosterRole));
        
        if(boosterRoleRemoved) {
            this.global.boostReact.clearEmoji(newMember.id);
        }
    }
}

module.exports = BoostReaction;
