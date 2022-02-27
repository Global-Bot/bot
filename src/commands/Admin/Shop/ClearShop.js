const Command = require('../../../core/classes/Command');

class ClearShop extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'clearshop';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Clears the shop';
        this.usage        = 'clearshop';
        this.expectedArgs = 0;
        this.cooldown     = 0;
        this.permissions  = 'admin';

        this.shop         = global.shop;
    }
    
    async execute({ message, args, guild }) {
        if ((await this.shop.count) == 0) return this.error(message.channel, "The shop is empty.");

        const msg = await this.sendMessage(message.channel, `**Are you sure you would like clear the shop?**`);
        const confirmation = await this.YoN(message);
        if (!confirmation) {
            return msg.edit(`${message.author}, Cancelled`)
            .then(_msg => setTimeout(() => _msg.delete().catch(e => e), 10000))
        }

        await this.shop.clear()
        .then(() => this.success(message.channel, `Cleared the shop`))
        .catch(err => this.error(message.channel, err?.message || err));
    }

    YoN(message) {
        return new Promise(resolve => {
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => e);
                    return resolve(false);
                }
                
                let msg = collected.first();
                if (msg) {
                    let answer = msg.content;
                    if ([ 'yes', 'yh', 'yeah', 'y' ].includes(answer?.toLowerCase())) {
                        return resolve(true);
                    }
                }

                return resolve(false);
            });
        });
    }
}

module.exports = ClearShop;
