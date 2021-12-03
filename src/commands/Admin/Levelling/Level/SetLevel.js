const Command = require('../../../../core/classes/Command');

class SetLevel extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'setlevel';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Sets the level of a user';
        this.usage        = 'setlevel <user> <level>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const level = parseFloat(args[1]);
        if (isNaN(level)) return this.error(message.channel, "Level must be a valid number");
        if (level <= 0) return this.error(message.channel, "The minimum level that can be set is 1");
        if (level > this.config.levelling.Limits.level) return this.error(message.channel, `The maximum level that can be set is ${this.utils.backTick(this.config.levelling.Limits.level)}`);

        const levelling    = user.levelling;
        const levelXP      = levelling.getLevelXP(level);

        const newUserXP    = await levelling.setXP(levelXP);
        const newUserLevel = levelling.getXPLevel(newUserXP);

        this.success(message.channel, `Set the level of ${this.fullName(user)} to ${newUserLevel} (${this.utils.backTick(newUserXP)} XP)`);
    }    
}

module.exports = SetLevel;
