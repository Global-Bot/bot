const Base = require('./Base');
const schedule = require('node-schedule');

class Module extends Base {
    constructor(global) {
        super(global);

        this._jobs = [];

        this._moduleProps = [
            { name: 'module',      type: 'string',  optional: false },
            { name: 'description', type: 'string',  optional: false },
            { name: 'core',        type: 'boolean', optional: false },
            { name: 'enabled',     type: 'boolean', optional: false },
        ];
    }

    schedule(interval, task) {
        const job = schedule.scheduleJob(interval, task)
		this._jobs.push(job);
	}

    registerHandler(event, handler) {
        return this.global.dispatcher.registerHandler(event, handler.bind(this))
    }

    _init(global) {
        if (this.init) {
            this.init(global);
        }
    }

    ensure() {    
        function ensureError(err, prop, exists, type, received) {
			return JSON.stringify({ err, prop, exists, type, received });
		}

        for (const { name, type, optional } of this._moduleProps) {
            if (!Object.hasOwnProperty.call(this, name) && typeof this[name] != type && !optional) {
                throw new Error(ensureError(
                    `Module "${this.constructor.name}": Required prop "${name}" does not exist`,
                    name,
                    false,
                    type,
                    typeof this[name]
                ));
            }
            
            if (typeof this[name] != type && !(optional && typeof this[name] == 'undefined')) {
                throw new Error(ensureError(
                    `Module "${this.constructor.name}": Required prop "${name}" is the wrong type, should be "${type}", received: "${typeof this[name]}"`,
                    name,
                    true,
                    type,
                    typeof this[name]
                ));
            }
        }
        
        return true;
    }
}

module.exports = Module;
