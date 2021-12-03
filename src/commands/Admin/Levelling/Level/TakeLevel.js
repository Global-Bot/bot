const Command = require('../../../../core/classes/Command');

class TakeLevel extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'takelevel';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Takes levels from a user';
        this.usage        = 'takelevel <user> (amount)';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        let level = parseFloat(args[1]);
        if (isNaN(level)) level = 1;

        const levelling    = user.levelling;

        const userXP       = await levelling.getXP();
        const userLevel    = levelling.getXPLevel(userXP);

        if (userLevel <= 0) return this.error(message.channel, "Cannot take anymore levels");
        if (level > userLevel) level = userLevel;

        const levelToSet   = userLevel - level;
        if (isNaN(levelToSet)) return this.error(message.channel, "Error resolving level to set");
        const levelToSetXP = levelling.getLevelXP(levelToSet);

        const newUserXP    = await levelling.setXP(levelToSetXP);
        const newUserLevel = levelling.getXPLevel(newUserXP);
        
        this.success(message.channel, `Took ${this.utils.backTick(level)} levels from ${this.fullName(user)}. ${this.fullName(user)}'s XP is now ${this.utils.backTick(newUserXP)} (level ${newUserLevel})`);
    }    
}

module.exports = TakeLevel;
