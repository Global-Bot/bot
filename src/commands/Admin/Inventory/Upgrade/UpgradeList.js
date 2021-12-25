const Command = require('../../../../core/classes/Command');

class UpgradeList extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'upgradelist';
        this.group        = 'Admin';
        this.aliases      = [ ];
        this.description  = 'View a list of upgrades';
        this.usage        = 'upgradelist';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, args }) {
        return this.sendMessage(message.channel, {
            embed: {
                title: "Upgrade - List",
                description: (await this.models.upgrade.findAll())
                .map(upgrade => `**${upgrade.displayName}** (${upgrade.id}) - **${upgrade.price}** ${this.config.emojis.get("star")} - x${upgrade.XPMultiplier} XP - x${upgrade.starMultiplier} Stars`)
                .join('\n')
            }
        });
    }    
}

module.exports = UpgradeList;
