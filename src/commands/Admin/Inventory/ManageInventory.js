const Command = require('../../../core/classes/Command');

class ManageInventory extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'manageinventory';
        this.group        = 'Admin';
        this.aliases      = [ 'manageinv', 'invmanage', 'invm' ];
        this.description  = 'Manage a users inventory';
        this.usage        = 'manageinventory (user) (action) (item) (type) (quantity)';
        this.expectedArgs = 5;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, guild, args }) {
        let user = this.resolveUser(message.guild, args[0]);
        if(!user) return this.error(message.channel, "No valid user detected!");
        
        let inventory = await user.inventory;
        if (inventory.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve inventory data");
        
        switch (args[1]) {
            case 'add':
                await inventory.add(args[2], args[3], args[4]);
                return await this.sendMessage(message.channel, `Added item ${args[2]}. Type ${args[3]}. Quantity ${args[4]}. To user ${user}`);
                break;
            
            case 'take':
                await inventory.take(args[2], args[3], args[4]);
                return await this.sendMessage(message.channel, `Took item ${args[2]}. Type ${args[3]}. Quantity ${args[4]}. From user ${user}`);
                break;
        
            default:
                return this.sendMessage(message.channel, 'Invalid action ' + args[0] + '. Must be either add or take.');
                break;
        }
    }    
}

module.exports = ManageInventory;