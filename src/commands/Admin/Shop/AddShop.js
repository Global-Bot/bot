const Command = require('../../../core/classes/Command');

class AddShop extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'addshop';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Adds an item to the shop';
        this.usage        = 'addshop <itemID> <item_type> (level_requirement)';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';

        this.shop         = global.shop;
    }
    
    async execute({ message, args, guild }) {
        const itemID        = args[0];
        const itemType      = args[1];
        const requiredLevel = !isNaN(parseFloat(args[2])) ? parseFloat(args[2]) : 0;

        if (requiredLevel < 0) return this.error(message.channel, "The minimum level requirement that can be set is 0");
        if (requiredLevel > Number.MAX_SAFE_INTEGER) return this.error(message.channel, `The maximum level requirement that can be set is ${Number.MAX_SAFE_INTEGER}`);

        if (await this.shop.has(itemID, itemType)) return this.error(message.channel, `The shop already has ${itemType} ${itemID}`);

        await this.shop.add(itemID, itemType, requiredLevel)
        .then(() => this.success(message.channel, `Added ${itemType} ${itemID} to the shop${requiredLevel != 0 ? ` with level requirement ${requiredLevel}` : ""}`))
        .catch(err => this.error(message.channel, err?.message || err));
    }
}

module.exports = AddShop;
