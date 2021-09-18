const Module = require('../core/classes/Module');
const config = require('../core/config');

class GlobalGuildManager extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'GlobalGuildManager';
        this.description = 'Removes the bot from unauthorized guilds';
        this.core        = true;
        this.enabled     = true;
        
        this.logger = this.global.logger.get('guildManager');
        
        this.global.dispatcher.registerHandler('messageCreate', this.messageCreate.bind(this));
        this.global.dispatcher.registerHandler('guildCreate', this.guildCreate.bind(this));
    }

    static get name() {
        return 'GlobalGuildManager';
    }

    async messageCreate({ message, guild }) {
        if (!message || this.global.utils.isWebhook(message) || !guild) return;

        if (!config.allowedGuilds.has(guild.id)) {
            this.leaveGuild(guild);
        }
    }
    
    async guildCreate(guild) {
        if (!guild) return;

        if (!config.allowedGuilds.has(guild.id)) {
            this.leaveGuild(guild);
        } else {
            this.global.logger.logWebhook(`Joined authorized guild ${guild.name} (${guild.id})`, await this.guildFields(guild), {
                uniqueMarker: 'guildCreate',
                webhook: 'guildManager',
                username: 'Guild Manager',
                text: this.guildText(guild)
            });
        }
    }

    async leaveGuild(guild) {        
        this.global.logger.logWebhook(`Left unauthorized guild ${guild.name} (${guild.id})`, await this.guildFields(guild), {
            uniqueMarker: 'unauthorizedGuild',
            webhook: 'guildManager',
            username: 'Guild Manager',
            text: this.guildText(guild)
        });
        
        guild.leave()
            .catch(console.error);
    }

    async guildFields(guild) {
        const owner = await guild.fetchOwner();
        return [
            { name: 'ID',         value: guild.id,       inline: true },
            { name: 'Name',       value: guild.id,       inline: true },
            { name: '\u200b',     value: '\u200b',       inline: true},
            { name: 'Owner ID',   value: owner.user.id,  inline: true },
            { name: 'Owner Name', value: owner.user.tag, inline: true},
            { name: '\u200b',     value: '\u200b',       inline: true},
        ]
    }

    guildText(guild) {
        return [
            `${guild.memberCount        } Members`,
            `${guild.channels.cache.size} Channels`,
            `${guild.roles.cache.size   } Roles`,
            `${guild.bans.cache.size    } Bans`
        ].join(' | ')
    }
}

module.exports = GlobalGuildManager;
