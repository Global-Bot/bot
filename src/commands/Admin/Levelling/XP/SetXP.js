const Command = require('../../../../core/classes/Command');

class SetXP extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'setxp';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Sets the XP of a user';
        this.usage        = 'setxp <user> <xp>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        let xp = parseFloat(args[1]);
        if (isNaN(xp)) return this.error(message.channel, "XP must be a valid number");
        if (xp < 0) return this.error(message.channel, "The minimum XP that can be set is 0");

        const levelling    = user.levelling;
        const newUserXP    = await levelling.setXP(xp);
        const newUserLevel = levelling.getXPLevel(newUserXP);

        this.success(message.channel, `Set the XP of ${this.fullName(user)} to ${this.utils.backTick(newUserXP)} (level ${newUserLevel})`);
    }    
}

module.exports = SetXP;
