const Command = require('../../../../core/classes/Command');

class AddLevel extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'addlevel';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Adds levels to a user';
        this.usage        = 'addlevel <user> (amount)';
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

        const levelToSet   = userLevel + level;
        if (isNaN(levelToSet)) return this.error(message.channel, "Error resolving level to set");
        const levelToSetXP = levelling.getLevelXP(levelToSet);

        const newUserXP    = await levelling.setXP(levelToSetXP);
        const newUserLevel = levelling.getXPLevel(newUserXP);

        this.success(message.channel, `Added ${this.utils.backTick(level)} levels to ${this.fullName(user)}. ${this.fullName(user)}'s XP is now ${this.utils.backTick(newUserXP)} (level ${newUserLevel})`);
    }    
}

module.exports = AddLevel;
