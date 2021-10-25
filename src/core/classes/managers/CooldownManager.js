const Base = require("../Base");

class CooldownManager extends Base {
    constructor(global) {
        super(global);
        this.database = this.models.cooldown;
    }

    expiry(time) {
        return new Date().getTime() + time;
    }

    async add(user_id, {time, type}) {
        await this.database.destroy({where: {id: user_id, type}});

        this.database.create({id: user_id, type, expire: this.expiry(time)})

        return true;
    }

    async remove(user_id, type) {
        this.database.destroy({where: {id: user_id, type}});
        return true;
    }

    async get(user_id, {type}) {
        let getEntry = await this.database.findOne({where: {id: user_id, type}});
        if(!getEntry) return false;
        let isExpired = (new Date().getTime() > getEntry.expire)
        if(isExpired) {
            this.remove(user_id, type)
            return false;
        } else {
            return getEntry.expire;
        }
    }

    get CONSTANTS() {
        return {
            WEEKLY: {
                time: 60000 * 60 * 24 * 7,
                type: "weekly"
            },
            DAILY: {
                time: 60000 * 60 * 24,
                type: "daily"
            }
        }
    }
}

module.exports = CooldownManager