const Base = require("./Base")

class EconomyProfile extends Base {
    constructor(user_id) {
        super();
        this.id = user_id;
        return (async () => {
            let getUserData = await this.fetch();
            if(!getUserData) {this.errored = true}
            for(let property in getUserData?.dataValues) {this[property] = getUserData[property]}
            return this;
        })()
    }

    async fetch() {
        return await this.models.economy.findOne({where: {id: this.id}}) || await this.models.economy.create({id: this.id})
    }

    save() {
        this.models.economy.update(this, {where: {id: this.id}});
    }

    async add(amount) {
        if(!amount || isNaN(amount) || !Number.isInteger(amount) || amount < 0 || amount > 1000000) return false;
        this.stars = this.stars + amount;
        return this.save();
    }

    async remove(amount) {
        if(!amount || isNaN(amount) || !Number.isInteger(amount) || amount < 0 || amount > 1000000) return false;
        this.stars = this.stars - amount;
        if(this.stars < 0) {this.stars = 0}
        return this.save();
    }
}

module.exports = EconomyProfile;