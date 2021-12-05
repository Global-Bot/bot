const Command = require('../../../core/classes/Command');

class Item extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'item';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Item management';
        this.usage        = [
            'item list',
            'item create <itemID> <displayName> <price>',
            'item update <itemID> (<new_displayName> <new_price>)',
            'item delete <itemID>',
        ];
        this.expectedArgs = 1;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message,  args }) {
        switch (args[0]) {
            case 'list':
                return this.sendMessage(message.channel, {
                    embed: {
                        title: "Item - List",
                        description: (await this.models.item.findAll())
                        .map(item => `**${item.displayName}** (${item.id}) - **${item.price}** ${this.config.emojis.get("star")}`)
                        .join('\n')
                    }
                });

            case 'create':
                const [ _, id, displayName, price ] = args;
                if (!id || !displayName || isNaN(parseInt(price))) return this.error(message.channel, `**Usage:** item create <itemID> <displayName> <price>`);

                const create = await this.models.item.create({ id, displayName, price: parseInt(price) }).catch(err => err);
                if (!create || create instanceof Error) return this.error(message.channel, (create?.errors || [])[0]?.message || "Unable to create item");

                return this.sendMessage(message.channel, "**Created item:** " + `**${displayName}** (${id}) - **${price}** ${this.config.emojis.get("star")}`);

            case 'update':
                const [ __, _id, newDisplayName, newPrice ] = args;
                if (!_id || !(newDisplayName && !isNaN(parseInt(newPrice)))) return this.error(message.channel, `**Usage:** item update <itemID> (<new_displayName> <new_price>)`);

                let newItem = {};
                if (newDisplayName) {
                    newItem['displayName'] = newDisplayName;
                }
                if (!isNaN(parseInt(newPrice))) {
                    newItem['price'] = parseInt(newPrice);
                }

                const update = await this.models.item.update(newItem, { where: { id: _id } }).catch(err => err);
                if (!update || !update[0] || update instanceof Error) return this.error(message.channel, (update?.errors || [])[0]?.message || "Unable to update item");

                const newDbItem = await this.models.item.findOne({ where: { id: _id } });
                if (!newDbItem) return this.error(message.channel, "Unable to find new item");

                return this.sendMessage(message.channel, "**Updated item:** " + `**${newDbItem.displayName}** (${newDbItem.id}) - **${newDbItem.price}** ${this.config.emojis.get("star")}`);
            
            case 'delete':
                const [ ___, __id ] = args;
                if (!__id) return this.error(message.channel, `**Usage:** item delete <itemID>`);

                const destroy = await this.models.item.destroy({ where: { id: __id } }).catch(err => err);
                if (!destroy || destroy instanceof Error) return this.error(message.channel, (destroy?.errors || [])[0]?.message || "Unable to destroy item");

                return this.sendMessage(message.channel, `**Deleted item:** ${__id}`);
        
            default:
                return this.error(message.channel, (`Invalid choice "${args[0]}"\n\n` + (Array.isArray(this.usage) ? this.usage.map(usage => this.utils.backTick(this.config.prefix + usage)).join(',\n') : this.utils.backTick(this.config.prefix + this.usage))));
        }
    }
}

module.exports = Item;
