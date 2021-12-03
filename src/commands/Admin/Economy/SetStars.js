const Command = require('../../../core/classes/Command');

class SetStars extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'setstars';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Sets the stars of a user';
        this.usage        = 'setstars <user> <stars>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        let stars = parseFloat(args[1]);
        if (isNaN(stars)) return this.error(message.channel, "Stars must be a valid number");
        if (stars < 0) return this.error(message.channel, "The minimum stars that can be set is 0");

        const economy = await user.economy;
        if (economy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");
        
        await economy.set(stars);
        const newUserStars = economy.stars;

        this.success(message.channel, `Set the stars of ${this.fullName(user)} to ${this.utils.backTick(newUserStars)}`);
    }    
}

module.exports = SetStars;
