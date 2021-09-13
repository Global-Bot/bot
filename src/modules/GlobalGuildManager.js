const Module = require('../core/classes/Module');
const config = require('../core/config');

class GlobalGuildManager extends Module {
    constructor(...args) {
        super(...args);

        this.module      = 'GlobalGuildManager';
        this.description = 'Removes the bot from unauthorized guilds';
        this.core        = true;
        this.enabled     = true;
    }

    static get name() {
        return 'GlobalGuildManager';
    }

    guildCreate(guild) {
        if (!guild) return;

        if (!config.allowedGuilds.includes(guild.id)) {
            guild.leave()
                .then(g => console.log(`Left disallowed guild ${g.name} (${g.id}) owned by ${g.ownerId}`))
                .catch(console.error);
        }
    }
}

module.exports = GlobalGuildManager;