const Command = require('../../core/classes/Command');

class Rep extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'rep';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'Gives a user a reputation point';
        this.usage        = 'rep <user>';
        this.expectedArgs = 1;
        this.cooldown     = 60000 * 60 * 24 * 1;
    }
    
    async execute({ message, args, guild }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");
        if (user == message.member) return this.error(message.channel, "Your cannot rep yourself");

        const reputation   = await user.reputation;
        if (reputation.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve reputation data");

        await reputation.addReputation();

        this.success(message.channel, `Successfully given a rep to ${user}`, {
            footer: {
                text: `${this.fullName(user)} now has ${reputation.reputation} reps`
            }
        });
    }    
}

module.exports = Rep;
