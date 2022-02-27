const Command = require('../../../core/classes/Command');

class Buy extends Command
{
    constructor(global, ...args)
    {
        super(global, ...args);

        this.name         = 'buy';
        this.group        = 'Economy';
        this.aliases      = [ "purchase" ];
        this.description  = 'Buy something from the shop';
        this.usage        = 'buy <item>';
        this.expectedArgs = 1;
        this.cooldown     = 5000;

        this.shop         = global.shop;
    }

    async execute({ message, args })
    {
        const shop = await this.shop.contents;
        const input = args.join(" ");

        const economy = await message.member.economy;
        if (economy.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve economy data");
        
        const levelling = message.member.levelling;
        const userLevel = levelling.getXPLevel(await levelling.getXP());

        const inventory = await message.member.inventory;
        if (inventory.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve inventory data");

        
        const item = await this.findAsync(shop, async (item) => (await this.displayName(item)).toLowerCase() == input.toLowerCase() || (await this.displayName(item)).toLowerCase().includes(input.toLowerCase()));
        if (!item) return this.error(message.channel, `Unable to find any items matching "${this.utils.backTick(input)}"`);
        const price = await this.itemPrice(item);
        if (price > economy.stars) return this.error(message.channel, "You cannot afford that item.");
        if (item.requiredLevel > userLevel) return this.error(message.channel, `You do not meet the level requirement of ${item.requiredLevel}.`);

        const msg = await this.sendMessage(message.channel, `**Are you sure you would like to purchase ${item.type} ${this.utils.backTick(await this.displayName(item))} for ${price} ${this.config.emojis.get("star")}?**`);
        const confirmation = await this.YoN(message);
        if (!confirmation) {
            return msg.edit(`${message.author}, Cancelled`)
            .then(_msg => setTimeout(() => _msg.delete().catch(e => e), 10000))
        }
        
        msg.delete().catch(e => e);
        
        await economy.remove(price);
        await inventory.add(item.itemID, item.type, 1);

        return this.success(message.channel, `${message.author} has purchased ${item.type} ${this.utils.backTick(await this.displayName(item))}`);
    }

    async findAsync(array, predicate) {
        for (const t of array) {
            if (await predicate(t)) {
                return t;
            }
        }

        return null;
    }

    YoN(message) {
        return new Promise(resolve => {
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => e);
                    return resolve(false);
                }
                
                let msg = collected.first();
                if (msg) {
                    let answer = msg.content;
                    if ([ 'yes', 'yh', 'yeah', 'y' ].includes(answer?.toLowerCase())) {
                        return resolve(true);
                    }
                }

                return resolve(false);
            });
        });
    }
}

module.exports = Buy;
