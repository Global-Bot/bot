const Module = require('../core/classes/Module');

class ButtonHandler extends Module {
    constructor(global) {
        super(global);
        
        this.module      = 'ButtonHandler';
        this.description = 'Distributes buttons clicks to commands';
        this.core        = true;
        this.enabled     = true;
    }

    static get name() {
        return 'ButtonHandler';
    }    

    async interactionCreate({ interaction, isAdmin }) {
        if (!this.validate(interaction)) return;
        const { identifier, data, command } = await this.resolve(interaction);

        const interactionCommand = this.global.commands.get(command);
        if (!interactionCommand || typeof interactionCommand.buttonClick != 'function') return;

        return interactionCommand.buttonClick({ interaction, identifier, data, isAdmin });
    }

}

module.exports = ButtonHandler;
