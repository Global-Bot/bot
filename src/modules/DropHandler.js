const Module = require("../core/classes/Module");

class DropHandler extends Module {
    constructor(global) {
        super(global);
        this.module      = 'DropHandler';
        this.description = 'Handles star drops';
        this.core        = true;
        this.enabled     = true;
    }

    static get name() {
        return 'DropHandler';
    }    

    async messageCreate(event) {
        const { message, guild } = event;
        if (!message || message.author.bot || !guild) return;
        this.global.drop.calculateMessage(message);
    }
    
}

module.exports = DropHandler;