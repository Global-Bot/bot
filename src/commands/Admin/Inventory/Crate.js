const Command = require('../../../core/classes/Command');

class Crate extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'crate';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Item management for crates';
        this.usage        = [
            'crate list (crate_itemID)',
            'crate create <crate_itemID> <crate_id> <crate_displayName> <crate_price>',
            'crate update <crate_itemID> (<new_crate_id> <new_crate_displayName> <new_crate_price>)',
            'crate delete <crate_itemID>',
        ];
        this.expectedArgs = 1;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }

    collectInput(message, question) {
        return new Promise(async resolve => {
            await message.channel.send(question).catch(err => err);
            
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => {});
                    return resolve(false);
                }
                
                let msg = collected.first();
                if (msg) return resolve(msg.content);

                return resolve(false);
            });
        })
    }

    YoN(message) {
        return new Promise((resolve, reject) => {
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => {});
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
    
    async execute({ message, guild, args }) {
        switch (args[0]) {
            case 'list':
                if (args[1]) {
                    const crate = await this.models.crate.findOne({ where: { id: args[1] } });
                    if (crate) {
                        let contains;
                        if (Array.isArray(crate.contains) && crate.contains.length > 0) {
                            contains = (await Promise.all(
                                crate.contains.map(async item => `**${this.utils.firstUppercase(item.type)}** - **${await this.displayName(item)}** (${item.id})`)
                            )).join('\n')
                        } else {
                            contains = "**This crate is empty.**";
                        }

                        return this.sendMessage(message.channel, {
                            embed: {
                                title: `Crate - **${crate.displayName}** (${crate.id})`,
                                description: `Price: **${crate.price}** ${this.config.emojis.get("star")}\n\nContains:\n${contains}`
                            }
                        });
                    }
                }

                return this.sendMessage(message.channel, {
                    embed: {
                        title: "Crate - List",
                        description: (await this.models.crate.findAll())
                        .map(crate => `**${crate.displayName}** (${crate.id}) - **${crate.price}** ${this.config.emojis.get("star")}`)
                        .join('\n')
                    }
                });
                break;

            case 'create':
                const [ _, id, displayName, price ] = args;
                if (!id || !displayName || isNaN(parseInt(price))) return this.error(message.channel, `**Usage:** crate create <crate_itemID> <crate_displayName> <crate_price>`);
                
                let numberOfItems = await this.collectInput(message, "How many items would you like this crate to contain?");
                if (!numberOfItems || isNaN(parseFloat(numberOfItems))) return this.error(message.channel, `**Usage:** crate create <crate_itemID> <crate_displayName> <crate_price>`);

                numberOfItems = parseFloat(numberOfItems);

                const contains = [];
                for (let i = 0; i < numberOfItems; i++) {
                    const mainEmbed = await this.sendMessage(message.channel, {
                        embed: {
                            title: `Add Item ${i + 1}`,
                            color: 'PURPLE'
                        }
                    })

                    let itemID = await this.collectInput(message, `Specify the item ID of item number ${i + 1}:`);
                    if (!itemID) continue;

                    await mainEmbed.edit({
                        embeds: [{
                            title: `Add Item ${i + 1}`,
                            description: `ID: ${this.utils.backTick(itemID)}`,
                            color: 'PURPLE'
                        }]
                    })
                    

                    let itemQuantity = await this.collectInput(message, `Specify the quantity of item number ${i + 1}:`);
                    if (!itemQuantity || isNaN(parseInt(itemQuantity))) continue;
                    itemQuantity = parseInt(itemQuantity);

                    await mainEmbed.edit({
                        embeds: [{
                            title: `Add Item ${i + 1}`,
                            description: `ID: ${this.utils.backTick(itemID)}\nQuantity: ${this.utils.backTick(itemQuantity)}`,
                            color: 'PURPLE'
                        }]
                    })


                    let itemType = await this.collectInput(message, `Specify the type of item number ${i + 1}:`);
                    if (!itemType) continue;

                    await mainEmbed.edit({
                        embeds: [{
                            title: `Add Item ${i + 1}`,
                            description: `ID: ${this.utils.backTick(itemID)}\nQuantity: ${this.utils.backTick(itemQuantity)}\nType: ${this.utils.backTick(itemType)}`,
                            color: 'PURPLE'
                        }]
                    })


                    contains.push({
                        id: itemID,
                        quantity: itemQuantity,
                        type: itemType
                    })
                }

                const create = await this.models.crate.create({ id, displayName, contains, price }).catch(err => err);
                if (!create || create instanceof Error) return this.error(message.channel, (create?.errors || [])[0]?.message || "Unable to create crate item");

                return this.sendMessage(message.channel, "**Created crate:** " + `**${displayName}** (${id}) - **${price}** ${this.config.emojis.get("star")}`);
                break;

            case 'update':
                const [ __, _id, newDisplayName, newPrice ] = args;
                if (!_id || !(newDisplayName && !isNaN(parseInt(newPrice)))) return this.error(message.channel, `**Usage:** crate update <crate_itemID> (<new_crate_displayName> <new_crate_price>)`);

                let newCrate = {};
                if (newDisplayName) {
                    newCrate['displayName'] = newDisplayName;
                }
                if (!isNaN(parseInt(newPrice))) {
                    newCrate['price'] = parseInt(newPrice);
                }

                const update = await this.models.crate.update(newCrate, { where: { id: _id } }).catch(err => err);
                if (!update || !update[0] || update instanceof Error) return this.error(message.channel, (update?.errors || [])[0]?.message || "Unable to update crate item");
                
                
                const newDbItem = await this.models.crate.findOne({ where: { id: _id }, raw: true });
                if (!newDbItem) return this.error(message.channel, "Unable to find new crate item");
                
                await this.sendMessage(message.channel, "**Would you like to edit the items contained in this crate?**");
                const confirmation = await this.YoN(message);
                if (confirmation) {
                    for (let i = 0; i < newDbItem.contains.length; i++) {
                        const item = newDbItem.contains[i];

                        const mainEmbed = await this.sendMessage(message.channel, {
                            embed: {
                                title: `Update Item ${i + 1}`,
                                description: `ID: ${this.utils.backTick(item.id)}\nQuantity: ${this.utils.backTick(item.quantity)}\nType: ${this.utils.backTick(item.type)}`,
                                color: 'PURPLE'
                            }
                        })
                    

                        let newItemID = await this.collectInput(message, `Specify the new ID of item number ${i + 1}:`);
                        if (!newItemID) continue;

                        await mainEmbed.edit({
                            embeds: [{
                                title: `Update Item ${i + 1}`,
                                description: `ID: ${this.utils.backTick(newItemID)}\nQuantity: ${this.utils.backTick(item.quantity)}\nType: ${this.utils.backTick(item.type)}`,
                                color: 'PURPLE'
                            }]
                        })
                        

                        let newItemQuantity = await this.collectInput(message, `Specify the new quantity of item number ${i + 1}:`);
                        if (!newItemQuantity || isNaN(parseInt(newItemQuantity))) continue;
                        newItemQuantity = parseInt(newItemQuantity);

                        await mainEmbed.edit({
                            embeds: [{
                                title: `Update Item ${i + 1}`,
                                description: `ID: ${this.utils.backTick(newItemID)}\nQuantity: ${this.utils.backTick(newItemQuantity)}\nType: ${this.utils.backTick(item.type)}`,
                                color: 'PURPLE'
                            }]
                        })


                        let newItemType = await this.collectInput(message, `Specify the new type of item number ${i + 1}:`);
                        if (!newItemType) continue;

                        await mainEmbed.edit({
                            embeds: [{
                                title: `Update Item ${i + 1}`,
                                description: `ID: ${this.utils.backTick(newItemID)}\nQuantity: ${this.utils.backTick(newItemQuantity)}\nType: ${this.utils.backTick(newItemType)}`,
                                color: 'PURPLE'
                            }]
                        })


                        newDbItem.contains[i] = {
                            id: newItemID,
                            quantity: newItemQuantity,
                            type: newItemType
                        }                        
                    }

                    await this.models.crate.update(newDbItem, { where: { id: _id } }).catch(err => err);
                }
                
                return this.sendMessage(message.channel, "**Updated crate:** " + `**${newDbItem.displayName}** (${newDbItem.id}) - **${newDbItem.price}** ${this.config.emojis.get("star")}`);
                break;
            
            case 'delete':
                const [ ___, __id ] = args;
                if (!__id) return this.error(message.channel, `**Usage:** crate delete <crate_itemID>`);

                const destroy = await this.models.crate.destroy({ where: { id: __id } }).catch(err => err);
                if (!destroy || destroy instanceof Error) return this.error(message.channel, (destroy?.errors || [])[0]?.message || "Unable to destroy crate item");

                return this.sendMessage(message.channel, `**Deleted crate:** ${__id}`);
                break;
        
            default:
                return this.error(message.channel, (`Invalid choice "${args[0]}"\n\n` + (Array.isArray(this.usage) ? this.usage.map(usage => this.utils.backTick(this.config.prefix + usage)).join(',\n') : this.utils.backTick(this.config.prefix + this.usage))));
                break;
        }
    }

    
}

module.exports = Crate;
