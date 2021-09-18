const Module = require('../core/classes/Module');
const config = require('../core/config');

class GlobalGuildManager extends Module {
    constructor(global) {
        super(global);
        this.logger = this.global.logger.get('guildManager');

        this.module      = 'GlobalGuildManager';
        this.description = 'Removes the bot from unauthorized guilds';
        this.core        = true;
        this.enabled     = true;

        this.global.dispatcher.registerHandler('messageCreate', this.messageCreate.bind(this));
        this.global.dispatcher.registerHandler('guildCreate', this.guildCreate.bind(this));
    }

    static get name() {
        return 'GlobalGuildManager';
    }

    messageCreate({ message, guild }) {
        if (!message || !guild) return;

        if (!config.allowedGuilds.has(guild.id)) {
            this.leaveGuild(guild);
        }
    }
    
    guildCreate(guild) {
        if (!guild) return;

        if (!config.allowedGuilds.has(guild.id)) {
            this.leaveGuild(guild);
        } else {
            this.logger.info(`Joined authorized guild ${guild.name} (${guild.id})`, 'guildCreate');
        }
    }

    async leaveGuild(guild) {
        const guildInfo = [
            `ID:   ${guild.id}`,
            `Name: ${guild.name}`,
        ];

        const owner = await guild.fetchOwner();
        const ownerInfo = [
            `ID:   ${owner.user.id}`,
            `Name: ${owner.user.tag}`,
        ];
        
        guild.leave()
            .then(() => this.logger.warn(`Unrecognised guild\nLeft disallowed guild\n\tGuild:\n\t\t${guildInfo.join('\n\t\t')}\n\tOwner:\n\t\t${ownerInfo.join('\n\t\t')}`, 'disallowedGuild'))
            .catch(console.error);
    }
}

module.exports = GlobalGuildManager;
