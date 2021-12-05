const Command = require('../../../core/classes/Command');

class Role extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'role';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Item management for roles';
        this.usage        = [
            'role list',
            'role create <role_itemID> <role_id> <role_displayName> <role_price>',
            'role update <role_itemID> (<new_role_id> <new_role_displayName> <new_role_price>)',
            'role delete <role_itemID>',
        ];
        this.expectedArgs = 1;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, args }) {
        switch (args[0]) {
            case 'list':
                return this.sendMessage(message.channel, {
                    embed: {
                        title: "Role - List",
                        description: (await this.models.role.findAll())
                        .map(role => `**${role.displayName}** (${role.id}) - ${this.utils.backTick(role.role)} - **${role.price}** ${this.config.emojis.get("star")}`)
                        .join('\n')
                    }
                });

            case 'create':
                const [ _, id, role, displayName, price ] = args;
                if (!id || !role || !displayName || isNaN(parseInt(price))) return this.error(message.channel, `**Usage:** role create <role_itemID> <role_id> <role_displayName> <role_price>`);

                const create = await this.models.role.create({ id, role, displayName, price: parseInt(price) }).catch(err => err);
                if (!create || create instanceof Error) return this.error(message.channel, (create?.errors || [])[0]?.message || "Unable to create role item");

                return this.sendMessage(message.channel, "**Created role:** " + `**${displayName}** (${id}) - ${this.utils.backTick(role)} - **${price}** ${this.config.emojis.get("star")}`);

            case 'update':
                const [ __, _id, newRoleID, newDisplayName, newPrice ] = args;
                if (!_id || !(newRoleID && newDisplayName && !isNaN(parseInt(newPrice)))) return this.error(message.channel, `**Usage:** role update <role_itemID> (<new_role_id> <new_role_displayName> <new_role_price>)`);

                let newRole = {};
                if (newRoleID) {
                    newRole['role'] = newRoleID;
                }
                if (newDisplayName) {
                    newRole['displayName'] = newDisplayName;
                }
                if (!isNaN(parseInt(newPrice))) {
                    newRole['price'] = parseInt(newPrice);
                }

                const update = await this.models.role.update(newRole, { where: { id: _id } }).catch(err => err);
                if (!update || !update[0] || update instanceof Error) return this.error(message.channel, (update?.errors || [])[0]?.message || "Unable to update role item");

                const newDbItem = await this.models.role.findOne({ where: { id: _id } });
                if (!newDbItem) return this.error(message.channel, "Unable to find new role item");

                return this.sendMessage(message.channel, "**Updated role:** " + `**${newDbItem.displayName}** (${newDbItem.id}) - ${this.utils.backTick(newDbItem.role)} - **${newDbItem.price}** ${this.config.emojis.get("star")}`);
            
            case 'delete':
                const [ ___, __id ] = args;
                if (!__id) return this.error(message.channel, `**Usage:** role delete <role_itemID>`);

                const destroy = await this.models.role.destroy({ where: { id: __id } }).catch(err => err);
                if (!destroy || destroy instanceof Error) return this.error(message.channel, (destroy?.errors || [])[0]?.message || "Unable to destroy role item");

                return this.sendMessage(message.channel, `**Deleted role:** ${__id}`);
        
            default:
                return this.error(message.channel, (`Invalid choice "${args[0]}"\n\n` + (Array.isArray(this.usage) ? this.usage.map(usage => this.utils.backTick(this.config.prefix + usage)).join(',\n') : this.utils.backTick(this.config.prefix + this.usage))));
        }
    }
}

module.exports = Role;
