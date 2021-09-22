const Command = require('../../core/classes/Command');

class Modules extends Command {
    constructor(global, ...args) {
        super(global, ...args);

        this.name         = 'modules';
        this.group        = 'Admin';
        this.aliases      = [ 'module' ];
        this.description  = 'Shows the currently loaded modules';
        this.usage        = 'modules';
        this.expectedArgs = 0;
        this.cooldown     = 1000;
        this.permissions  = 'admin';
    }

    async execute({ message }) {
        const moduleList = this.global.modules.map(module => {
            return `**${module.module}** - ${module.description}`;
        });

        const embed = {
			title: '**Modules**',
			description: moduleList.join('\n'),
            footer: {
                text: `${this.global.modules.size} modules loaded`
            }
		};

        return this.sendMessage(message.channel, { embed });
    }

}

module.exports = Modules;
