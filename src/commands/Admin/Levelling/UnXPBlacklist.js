const Command = require('../../../core/classes/Command');

class UnXPBlacklist extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'unxpblacklist';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Unblacklists a user from gaining XP';
        this.usage        = 'unxpblacklist <user>';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const levelling = user.levelling;
        if (!await levelling.getBlacklisted()) return this.error(message.channel, `${this.fullName(user)} is not XP blacklisted`);

        if (await levelling.takeBlacklisted() == false) {
            this.success(message.channel, `${this.fullName(user)} has been unblacklisted from gaining XP`);
        } else {
            return this.error(message.channel, `An error occurred while trying to unblacklist ${this.fullName(user)} from gaining XP`);
        }
    }    
}

module.exports = UnXPBlacklist;
