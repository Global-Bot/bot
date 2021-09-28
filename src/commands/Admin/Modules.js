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
        this.hide         = true;
    }
    
    async execute({ message }) {
        const modules = this.global.modules;
        const table = [
            [ 'Name', 'Description' ]
        ];
        
        modules.forEach(module => table.push([ module.module, module.description ]));
        
        const embed = {
            title: '**Modules**',
            description: this.codeBlock(this.table(table)),
            footer: {
                text: `${modules.size} modules loaded`
            }
        };
        
        return this.sendMessage(message.channel, { embed });
    }
    
}

module.exports = Modules;
