const Base = require('./Base');

class Command extends Base {
    constructor(global) {
        super(global);
        
        this._cooldowns = new Map();
        
        this._commandProps = [
            { name: 'name',           type: 'string',   optional: false },
            { name: 'group',          type: 'string',   optional: false },
            { name: 'aliases',        type: 'object',   optional: false },
            { name: 'description',    type: 'string',   optional: false },
            { name: 'usage',          type: 'string',   optional: false },
            { name: 'example',        type: 'string',   optional: true  },
            { name: 'expectedArgs',   type: 'number',   optional: false },
            { name: 'cooldown',       type: ['number', 'object'], optional: false },
            { name: 'execute',        type: 'function', optional: false },
            { name: 'permCheck',      type: 'function', optional: true  }
        ];
        
    }
    
    summary({ message, args, command, time }) {
        const bits = [];
        
        if (message) {
            bits.push(`message=${message.id}`);
        }
        
        if (args) {
            bits.push(`args=${args.length}`);
        }
        
        if (command) {
            bits.push(`command=${command}`);
        }
        
        if (time) {
            bits.push(`took=${time}ms`);
        }
        
        return `Command[${bits.join()}]`;
    }
    
    async shouldCooldown(message) {
        this.isLongCooldown = typeof this.cooldown == 'object';

        const cooldown = this.isLongCooldown ? await this.global.cooldown.get(message.author.id, this.cooldown) : this._cooldowns.get(message.author.id);
        if(this.isLongCooldown && cooldown) return cooldown;
        
        if (!cooldown) {
            return false;
        }

        let remainingTime = (Date.now() - cooldown)

        
        if (remainingTime < this.cooldown) {
            return Date.now() + this.cooldown;
        }
        
        this._cooldowns.delete(message.author.id);
        
        return false;
    }
    
    async _execute(event) {
        const { message, args } = event;
        
        if (args.length < this.expectedArgs || args && args[0] == 'help') {
            if (this.permissions == 'admin' && !event.isAdmin) {
                return Promise.resolve();
            }

            if (this.hide) {
                return Promise.resolve();
            }
            
            return this.help(message);
        }
        
        if (!event.isAdmin) {
            const cooldown = await this.shouldCooldown(message);
            
            if (cooldown) {
                return this.sendMessage(message.channel, `${message.author.mention}, you're on cooldown! You can do this **${this.moment(cooldown).fromNow()}**`, { deleteAfter: 10000 })
            }
        }
        
        this.logger.trace(`${this.summary({ message, args, command: this.name, time: 'N/A' })} Executing for ${message.author.username}: ${message.content}`, 'Execute');
        
        return this.execute(event)
        .then(() => {
            if (!this.isLongCooldown && !this._cooldowns.has(message.author.id)) {
                this._cooldowns.set(message.author.id, Date.now());
            } else if (this.isLongCooldown) {
                this.global.cooldown.add(message.author.id, this.cooldown)
            }
        });
    }
    
    help(message) {
        if (this.hide) return;

        // Wrap a string in backticks
        const bt = this.utils.backTick;

        const help = [];
        const prefix = this.config.prefix;
        
        if (this.aliases && this.aliases.length) {
			help.push({
                name: 'Aliases',
                value: bt(prefix + this.aliases.join(`, ${prefix}`)), 
                inline: true
            });
        }

        if (this.usage) {
            help.push({
                name: 'Usage',
                value: bt(prefix + this.usage),
                inline: true
            });
        }
        
        if (this.example) {
            help.push({
                name: 'Example',
                value: bt(prefix + this.example),
                inline: true
            });
        }
        

        const embed = {
			title: prefix + this.name,
			description: this.description,
            fields: help
		};

        return this.sendMessage(message.channel, { embed });
    }
    
    makeButton({name, user_id, emoji, type}) {
        return super.makeButton(name, user_id, this.name, emoji, type)
    }
    
    button(identifier, label, data = null, emoji, style = 'PRIMARY') {
        return super.button(identifier, this.name, label, data, emoji, style);
    }
    
    ensure() {
        function ensureError(err, prop, exists, type, received) {
            return JSON.stringify({ err, prop, exists, type, received });
        }
        
        for (const { name, type, optional } of this._commandProps) {
            if (!Object.hasOwnProperty.call(this, name) && typeof this[name] != type && !optional) {
                throw new Error(ensureError(`Command "${this.constructor.name}": Required prop "${name}" does not exist`, name, false, type, typeof this[name]));
            }
            
            if (typeof this[name] != type && (Array.isArray(type) && !type.includes(typeof this[name])) && !(optional && typeof this[name] == 'undefined')) {
                throw new Error(ensureError(`Command "${this.constructor.name}": Required prop "${name}" is the wrong type, should be "${type}", received: "${typeof this[name]}"`, name, true, type, typeof this[name]));
            }
        }
        
        return true;
    }
    
}
module.exports = Command;
