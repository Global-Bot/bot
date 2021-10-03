const Command = require('../../core/classes/Command');
const { inspect } = require('util')

class Eval extends Command {
    constructor(global, ...args) {
        super(global, ...args);
        
        this.name         = 'eval';
        this.group        = 'Admin';
        this.aliases      = [ 'e' ];
        this.description  = 'Evaluates JavaScript code represented as a string';
        this.usage        = 'eval (code)';
        this.expectedArgs = 1;
        this.cooldown     = 0;
        this.permissions  = 'admin';
        this.hide         = true;
    }
    
    async execute({ message, args, command, guild, isAdmin }) {
        // Variables for use in eval
        let msg      = message,
            global   = this.global,
            client   = this.client,
            config   = this.config,
            db       = this.db,
            models   = this.models,
            utils    = this.utils,
            users    = this.client.users.cache,
            guilds   = this.client.guilds.cache,
            channels = this.client.channels.cache
        
        let result;
        try {
            result = eval(args.join(' '));
        } catch (err) {
            result = err;
        }

        if (result?.then) {
            try {
                result = await result;
            } catch (err) {
                result = err;
            }
        }

        if (!result) {
            return this.error(message.channel, 'RESULT_INVALID', (result?.message || result));
        }

        let msgArray = [].concat(this.utils.splitMessage(result, 1500));

        for (const m of msgArray) {
            this.sendCode(message.channel, inspect(m).toString().replace(this.config.token, 'token'), 'js')
        }

        return Promise.resolve();
    }
    
}

module.exports = Eval;
