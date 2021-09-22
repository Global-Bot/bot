const Base = require('./Base');
const schedule = require('node-schedule');

class Module extends Base {
    constructor(global) {
        super(global);

        this._jobs = [];
    }

    schedule(interval, task) {
        const job = schedule.scheduleJob(interval, task)
		this._jobs.push(job);
	}

}

module.exports = Module;
