const Command = require('../../core/classes/Command');

class ClearInventory extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'clearinventory';
        this.group        = 'Admin';
        this.aliases      = [ 'clearinv' ];
        this.description  = 'Clear a users inventory';
        this.usage        = 'clearinventory (user)';
        this.expectedArgs = 1;
        this.cooldown     = 5000;
        this.permissions = 'admin';
    }
    
    async execute({ message, guild, args }) {
        const users = [];
        
        for (const arg of args) {
            let user = this.resolveUser(guild, arg);
            if (!user) continue;
            
            users.push(user);
        }
        
        if (!users.length) return this.error(message.channel, 'Failed to find those users');
        
        await this.sendMessage(message.channel, `Are you sure you want to clear the inventory of ${this.formatUsers(users)}? (${users.length} ${this.userWord(users)})`);
        
        const confirmation = await this.YoN(message);
        if (!confirmation) return this.sendMessage(message.channel, 'Cancelled clearing of inventory');
        
        const errored = [], cleared = [];
        
        for (const user of users) {
            let inventory = await user.inventory;
            if(inventory.errored) return this.error(message.channel, "A system error has occured", "Unable to retrieve inventory data");
            
            let clear = await inventory.clear();
            if (!clear) {
                errored.push(user);
            } else {
                cleared.push(user)
            }
        }

        let msg = [];

        if (errored.length) {
            msg.push(`Error clearing the inventory of ${errored.length} ${this.userWord(errored)}: ${this.formatUsers(errored)}`);
        }
        
        msg.push(`Cleared the inventory of ${cleared.length} ${this.userWord(cleared)}: ${this.formatUsers(cleared)}`);

        return this.sendMessage(message.channel, msg.join('\n'));
    }
    
    YoN(message) {
        return new Promise((resolve, reject) => {
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => {});
                    return resolve(false);
                }
                
                let msg = collected.first();
                if (msg) {
                    let answer = msg.content;
                    if (answer == 'yes') {
                        return resolve(true);
                    }
                }

                return resolve(false);
            });
        });
    }

    formatUsers(users) {
        return users
        .map(user => this.utils.backTick(user.user.tag))
        .join(', ');
    }

    userWord(users) {
        return `User${users.length == 1 ? '' : 's'}`
    }
    
}

module.exports = ClearInventory;
