const Command = require('../../../../core/classes/Command');

class UpgradeDelete extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'upgradedelete';
        this.group        = 'Admin';
        this.aliases      = [ ];
        this.description  = 'Deletes an upgrade';
        this.usage        = 'upgradedelete <id>';
        this.expectedArgs = 1;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, args }) {
        const id = args[0];
        
        const destroy = await this.models.upgrade.destroy({ where: { id } }).catch(err => err);
        if (!destroy || destroy instanceof Error) return this.error(message.channel, (destroy?.errors || [])[0]?.message || "Unable to destroy upgrade item");
        
        return this.sendMessage(message.channel, `**Deleted upgrade:** ${id}`);
    }
}

module.exports = UpgradeDelete;
