const Command = require('../../core/classes/Command');

const util = require('util');
const exec = util.promisify(require('child_process').exec);

class Shell extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'shell';
        this.group        = 'Admin';
        this.aliases      = [];
        this.description  = 'Spawns a shell then executes the command within that shell';
        this.usage        = 'shell <command>';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
        this.hide         = true;
    }
    
    async execute({ message, args }) {
        try {
            const { stdout, stderr } = await exec(args.join(' '));
            
            if (stderr) throw new Error(stderr);
            
            this.sendMessage(message.channel, { embed: {
                description: this.codeBlock(stdout || 'No output')
            } });            
        } catch (err) {
            return this.error(message.channel, "Shell command failed" + this.codeBlock(err.message));
        }
    }
}

module.exports = Shell;
