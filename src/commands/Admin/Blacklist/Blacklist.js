const Command = require('../../../core/classes/Command');

class Blacklist extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'blacklist';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Blacklists a user from the bot';
        this.usage        = 'blacklist <user>';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, guild }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const blacklist = user.blacklist;
        if (await blacklist.get()) return this.error(message.channel, `${this.fullName(user)} is already blacklisted`);

        if (await blacklist.add() == true) {
            this.success(message.channel, `${this.fullName(user)} has been blacklisted`);
        } else {
            return this.error(message.channel, `An error occurred while trying to blacklist ${this.fullName(user)}`);
        }
    }
}

module.exports = Blacklist;
