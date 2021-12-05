const Command = require('../../core/classes/Command');

class Rep extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'reps';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'View how many reputation points a user has';
        this.usage        = 'reps (user)';
        this.expectedArgs = 0;
        this.cooldown     = 0;
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]) || message.member;
        if (!user) return this.error(message.channel, "Failed to find that user");

        const reputation   = await user.reputation;
        if (reputation.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve reputation data");

        this.sendMessage(message.channel, { embed: { description: `${this.fullName(user)} has ${reputation.reputation} reps` } });
    }
}

module.exports = Rep;
