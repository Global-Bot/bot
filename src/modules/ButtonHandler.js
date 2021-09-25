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
        if (!interaction) return;
        
        // Check the customID is legitimate and comes from the bot
        const customId = interaction.customId;
        if (!customId) return;

        // Check the format of the customId and break it up into parts
        const idParts = customId.split('-');
        if (!idParts || idParts.length != 3) return;
        let interactionIdentifier = idParts[2];

        // Check if there is any saved data on the interaction customID
        let data = null;
        if (await this.hasData(customId)) {
            // Get the data if it exists
            const interactionData = await this.getData(customId);
            if (interactionData) {
                data = interactionData;
            }
        }

        // Check if a button identifier was provided
        let identifier = null;
        if (interactionIdentifier) {
            identifier = interactionIdentifier;
        }

        // Find the command and check if it has a buttonClick method
        const command = this.global.commands.get(idParts[0]);
        if (!command) return;

        return command.buttonClick({ interaction, identifier, data, isAdmin });
    }

}

module.exports = ButtonHandler;
