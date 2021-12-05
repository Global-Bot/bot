const Command = require('../../../core/classes/Command');

class AddStars extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'addstars';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Adds stars to a user';
        this.usage        = 'addstars <user> <stars>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';
    }
    
    async execute({ message, args, guild }) {
        const user = this.resolveUser(guild, args[0]);
        if (!user) return this.error(message.channel, "Failed to find that user");

        const stars = parseFloat(args[1]);
        if (isNaN(stars)) return this.error(message.channel, "Stars must be a valid number");

        const economy = await user.economy;
        if (economy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");

        await economy.add(stars);
        const newUserStars = economy.stars;

        this.success(message.channel, `Added ${this.utils.backTick(stars)} stars to ${this.fullName(user)}. ${this.fullName(user)}'s star balance is now ${this.utils.backTick(newUserStars)}`);
    }    
}

module.exports = AddStars;
