const Command = require('../../core/classes/Command');

class Country extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'country';
        this.group        = 'Levelling';
        this.aliases      = [];
        this.description  = 'Set your country';
        this.usage        = 'country';
        this.expectedArgs = 0;
        this.cooldown     = 5000;
    }

    async execute({ message }) {
        const country = await this.collectInput(message, "What is your country?");
        if (!country) return;
        
        const countryData = this.global.countryData.find(c => c?.name?.toLowerCase() == country?.toLowerCase() || c?.code?.toLowerCase() == country?.toLowerCase());
        if (!countryData) return this.error(message.channel, `${this.utils.backTick(country)} is not a valid country`);
        
        const authorCountry = message.author.country;
        const setauthorCountry = await authorCountry.set(countryData.name);
        
        this.success(message.channel, `Your country has been set to :flag_${countryData?.code?.toLowerCase()}: **${setauthorCountry}**`);
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

module.exports = Country;
