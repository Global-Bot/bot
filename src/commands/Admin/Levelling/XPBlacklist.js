const Command = require('../../../core/classes/Command');

class XPBlacklist extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'xpblacklist';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Blacklists a user from gaining XP';
        this.usage        = 'xpblacklist <user>';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, guild }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const levelling = user.levelling;
        if (await levelling.getBlacklisted()) return this.error(message.channel, `${this.fullName(user)} is already XP blacklisted`);

        if (await levelling.addBlacklisted() == true) {
            this.success(message.channel, `${this.fullName(user)} has been XP blacklisted`);
        } else {
            return this.error(message.channel, `An error occurred while trying to XP blacklist ${this.fullName(user)}`);
        }
    }    
}

module.exports = XPBlacklist;
