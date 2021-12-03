const Command = require('../../../core/classes/Command');

class TakeStars extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'takestars';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Takes stars from a user';
        this.usage        = 'takestars <user> <stars>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        let stars = parseFloat(args[1]);
        if (isNaN(stars)) return this.error(message.channel, "Stars must be a valid number");

        const economy = await user.economy;
        if (economy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        if (stars > economy.stars) stars = economy.stars;

        await economy.remove(stars);
        const newUserStars = economy.stars;

        this.success(message.channel, `Took ${this.utils.backTick(stars)} stars from ${this.fullName(user)}. ${this.fullName(user)}'s star balance is now ${this.utils.backTick(newUserStars)}`);
    }    
}

module.exports = TakeStars;
