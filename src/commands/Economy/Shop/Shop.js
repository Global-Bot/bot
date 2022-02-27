const Command = require('../../../core/classes/Command');

class Shop extends Command
{
    constructor(global, ...args)
    {
        super(global, ...args);

        this.name         = 'shop';
        this.group        = 'Economy';
        this.aliases      = [ "store" ];
        this.description  = 'View the shop';
        this.usage        = 'shop';
        this.expectedArgs = 0;
        this.cooldown     = 5000;

        this.shop         = global.shop;
    }

    async execute({ message })
    {
        const shop = this.utils.groupArray(await this.shop.contents, "type");

        let shopText = (
            await Promise.all(
                Object.keys(shop).map(
                    async type => {
                        const items = await Promise.all(
                            shop[type].map(
                                async item => `${await this.displayName(item)} - **${await this.itemPrice(item)}** ${this.config.emojis.get("star")}${item.requiredLevel != 0 ? ` (Level ${item.requiredLevel} only)` : ""}`
                            )
                        )
                        return `__**${this.utils.firstUppercase(type)}s:**__\n${items.join("\n")}`
                    }
                )
            )
        ).join("\n\n");

        if ((await this.shop.count) == 0)
        {
            return this.error(message.channel, "The shop is empty.");   
        }

        return this.sendMessage(message.channel, {
            embed: {
                title: "Shop",
                description: shopText,
                thumbnail: {
                    url: this.client.user.avatarURL()
                }
            }
        });        
    }
}

module.exports = Shop;
