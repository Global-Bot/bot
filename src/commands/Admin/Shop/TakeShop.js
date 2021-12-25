const Command = require('../../../core/classes/Command');

class TakeShop extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'takeshop';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Takes an item from the shop';
        this.usage        = 'takeshop <itemID> <item_type>';
        this.expectedArgs = 2;
        this.cooldown     = 0;
        this.permissions  = 'admin';

        this.shop         = global.shop;
    }
    
    async execute({ message, args, guild }) {
        const itemID    = args[0];
        const itemType  = args[1];

        if (!await this.shop.has(itemID, itemType)) return this.error(message.channel, `The shop doesn't have ${itemType} ${itemID}`);

        await this.shop.take(itemID, itemType)
        .then(() => this.success(message.channel, `Took ${itemType} ${itemID} from the shop`))
        .catch(err => this.error(message.channel, err?.message || err));
    }    
}

module.exports = TakeShop;
