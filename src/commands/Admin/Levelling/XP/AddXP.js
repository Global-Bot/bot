const Command = require('../../../../core/classes/Command');

class AddXP extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'addxp';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Adds XP to a user';
        this.usage        = 'addxp <user> <xp>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const xp = parseFloat(args[1]);
        if (isNaN(xp)) return this.error(message.channel, "XP must be a valid number");

        const levelling    = user.levelling;
        const newUserXP    = await levelling.addXP(xp);
        const newUserLevel = levelling.getXPLevel(newUserXP);

        this.success(message.channel, `Added ${this.utils.backTick(xp)} XP to ${this.fullName(user)}. ${this.fullName(user)}'s XP is now ${this.utils.backTick(newUserXP)} (level ${newUserLevel})`);
    }    
}

module.exports = AddXP;
