const Command = require('../../../../core/classes/Command');

class TakeXP extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'takexp';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Takes XP from a user';
        this.usage        = 'takexp <user> <xp>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        let xp = parseFloat(args[1]);
        if (isNaN(xp)) return this.error(message.channel, "XP must be a valid number");

        const levelling    = user.levelling;
        const userXP       = await levelling.getXP(xp);

        if (xp > userXP) xp = userXP;

        const newUserXP    = await levelling.takeXP(xp);
        const newUserLevel = levelling.getXPLevel(newUserXP);

        this.success(message.channel, `Took ${this.utils.backTick(xp)} XP from ${this.fullName(user)}. ${this.fullName(user)}'s XP is now ${this.utils.backTick(newUserXP)} (level ${newUserLevel})`);
    }    
}

module.exports = TakeXP;
