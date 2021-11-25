const Command = require('../../core/classes/Command');
const { MessageActionRow, MessageSelectMenu } = require('discord.js');

class Inventory extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'inventory';
        this.group        = 'Economy';
        this.aliases      = [ 'inv', 'i' ];
        this.description  = 'View a users inventory';
        this.usage        = 'inventory (user)';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
        this.permissions  = 'admin';
        
        this.global.dispatcher.registerHandler('interactionCreate', this.dropdownChange.bind(this));
    }
    
    async execute({ message, guild, args }) {
        let user = this.resolveUser(guild, args[0]) || message.member;
        if (!user) {
            return this.error(message.channel, 'Failed to find that user');
        }
        
        return this.sendMessage(message.channel, await this.inventoryEmbed(user, null, message.author.id, true));
    }
    
    async buttonClick({ interaction, identifier, data, isAdmin }) {
        if (interaction.user.id != data?.author) return;
        if (interaction.user.id != data?.user) return this.sendMessage(interaction.message.channel, `${interaction.user}, This is not your inventory!`, { deleteAfter: 10000 });
        
        await interaction.deferUpdate();
        
        const user = interaction.message.guild.members.cache.get(data?.user);
        if (!user) return await interaction.followUp({
            ephemeral: true,
            content: '**The user for this inventory is invalid.**'
        });

        const inventory = await user.inventory;
        if (inventory.errored) return;
        
        const listMenu = [];
        let items = {};
        
        const conts = await this.contents(user);
        if (conts.length <= 0) {
            return await interaction.followUp({
                ephemeral: true,
                content: '**This inventory is empty.**'
            });
        } else {
            const contents = this.utils.groupArray(conts, 'type');
            for (const type in contents) {
                for (const item of contents[type]) {
                    const customID = this.customID(item.itemID, this.name);
                    
                    listMenu.push({
                        label: (await this.displayName(item)) + ` (x${item.quantity})`,
                        value: customID
                    });
                    
                    items[customID] = item;
                }
            }
        }
        
        const customID = this.customID('item_select', this.name);
        await this.setData(customID, data);
        
        const selectMenu = new MessageSelectMenu()
        .setCustomId(customID)
        .setPlaceholder('Select an item')
        .setMinValues(1)
        .setMaxValues(1)
        .addOptions(listMenu);
        
        const list = new MessageActionRow()
        .addComponents(selectMenu);
        
        const message = await interaction.followUp({
            ephemeral: false,
            content: `<@!${data?.author}>, Pick an item to ${identifier.toLowerCase()}`,
            components: [ list ]
        });
        if (!message) return;
        
        const filter = i => {
            i.deferUpdate();
            return i.user.id == data?.author;
        };
        message.awaitMessageComponent({ filter, componentType: 'SELECT_MENU', time: 60000 })
        .then(i => {
            const id = i?.values[0];
            if (!id) return;
            
            const item = items[id];
            if (!item) return;
            
            return processSelected.call(this, item);
        })
        .catch(err => {
            this.logger.error(err)
            message.delete().catch(e => {})
        });
        
        function collectUser(message) {
            return new Promise((resolve, reject) => {
                const filter = m => m.author.id == data?.author;
                const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
                
                collector.on('end', async (collected, reason) => {
                    if (reason == 'time') {
                        message.delete().catch(e => {});
                        return resolve(false);
                    }
                    
                    let msg = collected.first();
                    if (!msg) return resolve(false);
                    
                    if (msg.content.toLowerCase() == 'cancel') {
                        await this.sendMessage(message.channel, `<@!${data?.author}>, Cancelled`, { deleteAfter: 10000 });
                        setTimeout(() => {
                            msg.delete().catch(() => true);
                        }, 10000);
                        return resolve(false);
                    }
                    
                    let user = this.resolveUser(message.guild, msg.content);
                    if (user) {
                        setTimeout(() => {
                            msg.delete().catch(() => true);
                        }, 10000);
                        return resolve(user);
                    }
                    
                    setTimeout(() => {
                        msg.delete().catch(() => true);
                    }, 10000);
                    await this.sendMessage(message.channel, `<@!${data?.author}>, Invalid user, try again. You can type ${this.utils.backTick('cancel')} to stop at any time.`, { deleteAfter: 10000 });
                    return resolve(await collectUser.call(this, message));
                });
            });
        }
        
        const dn = this.displayName
        async function processSelected(item) {
            async function translate(user, str) {
                if (typeof user == 'string') {
                    str = user;
                }
                
                return str
                .replace('{item}', `${this.utils.backTick((await dn(item)))} (${this.utils.firstUppercase(item?.type?.toLowerCase())})`)
                .replace('{user}', user?.toString());
            }
            
            function YoN(_m) {
                return new Promise((resolve, reject) => {
                    const filter = m => m.author.id == data?.author;
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
                                setTimeout(() => {
                                    msg.delete().catch(() => true);
                                }, 10000);
                                return resolve(true);
                            }
                        }
                        
                        setTimeout(() => {
                            msg.delete().catch(() => true);
                        }, 10000);
                        return resolve(false);
                    });
                });
            }
            
            let id = identifier?.toLowerCase();
            if (id == 'use') {
                await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, Are you sure you want to use: {item} - yes/no`),
                    components: []
                });
                const confirmation = await YoN(message);
                if (!confirmation) {
                    return message.edit(`<@!${data?.author}>, Cancelled`)
                    .then(_msg => setTimeout(() => _msg.delete().catch(e => {}), 10000))
                }

                let use = await inventory.use(item);
                if (!use) return await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, an error occurred.`),
                    components: []
                });
                
                
                return await message.edit({
                    ephemeral: false,
                    content: this.config.emojis.get('success') + await translate.call(this, user, ` <@!${data?.author}> used: {item}`),
                    components: []
                });
            } else if (id == 'give') {
                let translations = [
                    'give: {item}',
                    'give {user}: {item} - yes/no',
                    'gave {user} -> {item}',
                ]
                
                
                let msg = await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, `<@!${data?.author}>, Provide a user to ${translations[0]}`),
                    components: []
                });
                let user = await collectUser.call(this, msg);
                if (!user) return;
                
                await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, Are you sure you want to ${translations[1]}`),
                    components: []
                });
                const confirmation = await YoN(message);
                if (!confirmation) {
                    return message.edit(`<@!${data?.author}>, Cancelled`)
                    .then(_msg => setTimeout(() => _msg.delete().catch(e => {}), 10000))
                }

                let give = await inventory.give(item, user);
                if (!give) return await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, an error occurred.`),
                    components: []
                });
                
                
                return await message.edit({
                    ephemeral: false,
                    content: this.config.emojis.get('success') + await translate.call(this, user, ` <@!${data?.author}> ${translations[2]}`),
                    components: []
                });
            } else if (id == 'sell') {
                await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, Are you sure you want to sell: {item} - yes/no`),
                    components: []
                });
                const confirmation = await YoN(message);
                if (!confirmation) {
                    return message.edit(`<@!${data?.author}>, Cancelled`)
                    .then(_msg => setTimeout(() => _msg.delete().catch(e => {}), 10000))
                }

                let sell = await inventory.sell(item);
                if (!sell) return await message.edit({
                    ephemeral: false,
                    content: await translate.call(this, user, `<@!${data?.author}>, an error occurred.`),
                    components: []
                });
                
                
                return await message.edit({
                    ephemeral: false,
                    content: this.config.emojis.get('success') + await translate.call(this, user, ` <@!${data?.author}> sold: {item} for ${sell.price} ${this.config.emojis.get("star")}`),
                    components: []
                });
            } else return;
        }
    }
    
    async dropdownChange({ interaction, isAdmin }) {
        if (!this.validate(interaction, 'dropdown')) return;
        const { identifier, data, command } = await this.resolve(interaction, 'dropdown');
        if (!(identifier == 'category_select' && command == this.name)) return;
        if (interaction.user.id != data.author) return;
        
        const type = interaction?.values[0];
        
        try {
            const user = this.global.client.users.cache.get(data.user);
            const interactionUser = Object.assign(user, { user });
            const inventoryTypeSelected = await this.inventoryEmbed(interactionUser, type, data.author);
            
            await interaction.deferUpdate();
            await interaction.editReply(inventoryTypeSelected);
        } catch (err) {}
    }
    
    async inventoryEmbed(user, type, originalAuthor, hide) {
        const inventory = {};
        
        // Initial inventory command (not a dropdown select)
        if (!type) {
            Object.assign(inventory, await this.mainPage(user, originalAuthor, hide));
        } else { // Type provided (dropdown select)
            Object.assign(inventory, await this.typePage(user, type, originalAuthor));
        }
        
        return inventory;
    }
    
    async mainPage(user, originalAuthor, hide) {
        const mainPage = {};
        
        let description = this.howTo(user).description + '\n\n';
        
        const conts = await this.contents(user);
        if (conts.length <= 0) {
            description += '**This inventory is empty.**';
        } else {
            if (!hide) {
                const contents = this.utils.groupArray(conts, 'type');
                for (const type in contents) {
                    description += [
                        `**${this.firstUpperCase(type)}s:**`,
                        await Promise.all(contents[type].map(async (item, i) => {
                            return `${this.utils.backTick(`${i + 1}.`)} **${await this.displayName(item)}** (x${item.quantity})`;
                        })),
                        '', ''
                    ].join('\n');
                }
            }
        }
        
        mainPage.embeds = [
            {
                title: `${this.fullName(user)}'s Inventory`,
                description,
                color: 'PURPLE'
            }
        ];

        mainPage.components = await this.rows(user, null, originalAuthor);
        
        return mainPage;
    }
    
    async typePage(user, type, originalAuthor) {
        const typePage = {};
        const contents = this.utils.groupArray(await this.contents(user), 'type');
        
        let description = this.howTo(user).description + '\n\n';
        
        const typeItems = contents[type];
        if (typeItems.length <= 0) {
            description += '**This inventory is empty.**';
        } else {
            description += (await Promise.all(
                typeItems.map(async (item, i) => `${this.utils.backTick(`${i + 1}.`)} **${await this.displayName(item)}** (x${item.quantity})`)
            )).join('\n');
        }
        
        
        typePage.embed = {
            title: `${this.fullName(user)}'s Inventory - ${this.utils.firstUppercase(type)}s`,
            description,
            color: 'PURPLE'
        };
        
        typePage.embeds = [ typePage.embed ];
        
        typePage.components = await this.rows(user, type, originalAuthor);
        
        return typePage;
    }
    
    async rows(user, type, originalAuthor) {
        const dropdown = await this.dropdown(user, type, originalAuthor);
        const buttons = await this.buttons(user, originalAuthor);
        
        return !dropdown ? [] : [ dropdown, buttons ];
    }
    
    async buttons(user, originalAuthor) {
        const data = { author: originalAuthor, user: user.user.id };
        const buttons = [
            this.button('use', 'Use', data),
            this.button('give', 'Give', data),
            this.button('sell', 'Sell', data),
        ];
        
        return new MessageActionRow()
        .addComponents(buttons);
    }
    
    async dropdown(user, selectedType, originalAuthor) {
        let types = (await this.contents(user))
        .map(item => item?.type ? this.firstUpperCase(item?.type) : null)
        .filter(item => !!item);
        types = this.removeDuplicates(types);
        
        if (types.length > 0) {
            types = types.map(type => {
                return {
                    label: `${type}s`,
                    value: type?.toLowerCase(),
                    default: type?.toLowerCase() == selectedType?.toLowerCase()
                }
            });
        } else {
            return false;
        }
        
        const customID = this.customID('category_select', this.name);
        await this.setData(customID, { author: originalAuthor, user: user.user.id });
        
        const selectMenu = new MessageSelectMenu()
        .setCustomId(customID)
        .setPlaceholder('Select a type')
        .setMinValues(0)
        .setMaxValues(1)
        .addOptions(types);
        
        return new MessageActionRow()
        .addComponents(selectMenu);
    }
    
    howTo(user) {
        return {
            title: 'Inventory Help',
            description: [
                'Use the dropdown menu to scroll through roles, items, crates or upgrades.',
                'Please react with a number to select the role/item/crate/upgrade.'
            ].join('\n'),
            thumbnail: user.user.avatarURL(),
            color: 'PURPLE'
        }
    }
    
    async contents(user) {
        let inventory = await user.inventory;
        if (inventory.errored) return [];
        
        return inventory.contents;
    }
}

module.exports = Inventory;
