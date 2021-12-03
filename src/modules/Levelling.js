const Module = require('../core/classes/Module');

class Levelling extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'Levelling';
        this.description = 'Levelling';
        this.core        = true;
        this.enabled     = true;
        
        this.handleXPMessage = this.handleXPMessage.bind(this);
    }

    static get name() {
        return 'Levelling';
    }
    
    async handleXPMessage(event) {
        const { message, guild } = event;
        if (!message || message.author.bot || !guild || message.author.bot) return;

        const authorLevelling = message.author.levelling;
        if (await authorLevelling.getBlacklisted()) return;

        if (this.config.levelling.XPMessage.excludedChannels.includes(message.channel.id)) return;

        authorLevelling.processXPMessage(event);
    }

    async messageCreate({ message, guild }) {
        if (!message || this.utils.isWebhook(message) || !guild || message.author.bot) return;

        const authorLevelling = message.author.levelling;
        if (await authorLevelling.getBlacklisted()) return;
        
        await authorLevelling.addMessages(1);
        await authorLevelling.addWeeklyMessages(1);
    }
}

module.exports = Levelling;
