const Command = require('../../../../core/classes/Command');

class UpgradeCreate extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'upgradecreate';
        this.group        = 'Admin';
        this.aliases      = [ ];
        this.description  = 'Create an upgrade';
        this.usage        = 'upgradecreate <id> <displayName> <XPMultiplier> <starMultiplier> <price>';
        this.expectedArgs = 5;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, args }) {
        const id             = args[0];
        const displayName    = args[1]
        const XPMultiplier   = parseInt(args[2])
        const starMultiplier = parseInt(args[3])
        const price          = parseFloat(args[4])

        if (isNaN(XPMultiplier))   return this.error(message.channel, "XP multiplier must be a valid number")
        if (isNaN(starMultiplier)) return this.error(message.channel, "Star multiplier must be a valid number")
        if (isNaN(price))          return this.error(message.channel, "Price must be a valid number")

        if (XPMultiplier < 0)      return this.error(message.channel, "XP multiplier minimum is 0")
        if (starMultiplier < 0)    return this.error(message.channel, "Star multiplier minimum is 0")
        if (price < 0)             return this.error(message.channel, "Price minimum is 0")

        const create = await this.models.upgrade.create({ id, displayName, XPMultiplier, starMultiplier, price }).catch(err => err);
        if (!create || create instanceof Error) return this.error(message.channel, (create?.errors || [])[0]?.message || "Unable to create upgrade item");

        return this.sendMessage(message.channel, "**Created upgrade:** " + `**${displayName}** (${id}) - **${price}** ${this.config.emojis.get("star")} - x${XPMultiplier} XP - x${starMultiplier} Stars`);
    }
}

module.exports = UpgradeCreate;
