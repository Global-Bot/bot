const Command = require('../../../core/classes/Command');

class UnBlacklist extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'unblacklist';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Unblacklists a user from the bot';
        this.usage        = 'unblacklist <user>';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, guild }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const blacklist = user.blacklist;
        if (!await blacklist.get()) return this.error(message.channel, `${this.fullName(user)} is not blacklisted`);

        if (await blacklist.take() == false) {
            this.success(message.channel, `${this.fullName(user)} has been unblacklisted`);
        } else {
            return this.error(message.channel, `An error occurred while trying to unblacklist ${this.fullName(user)}`);
        }
    }    
}

module.exports = UnBlacklist;
