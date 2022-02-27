const Command = require('../../core/classes/Command');

class About extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'about';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'Set your about';
        this.usage        = 'about';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        const about = await this.collectInput(message, "What is your about?");
        if (!about) return;
        
        const authorAbout = message.author.about;
        const setauthorAbout = await authorAbout.set(about.substring(0, this.config.levelling.Limits.AboutLength));
        
        this.success(message.channel, `Your about has been set to:${this.codeBlock(setauthorAbout)}`);
    }

    collectInput(message, question) {
        return new Promise(async resolve => {
            await message.channel.send(question).catch(err => err);
            
            const filter = m => m.author.id == message.author.id;
            const collector = message.channel.createMessageCollector({ filter, max: 1, time: 60000 });
            
            collector.on('end', async (collected, reason) => {
                if (reason == 'time') {
                    message.delete().catch(e => e);
                    return resolve(false);
                }
                
                let msg = collected.first();
                if (msg) return resolve(msg.content);

                return resolve(false);
            });
        })
    }
}

module.exports = About;
