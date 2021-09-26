const Base = require("./Base");

class ReputationProfile extends Base {
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
        return await this.models.reputation.findOne({where: {id: this.id}}) || await this.models.reputation.create({id: this.id});
    }

    save() {
        this.models.reputation.update(this, {where: {id: this.id}});
        return;
    }

    addReputation() {
        this.reputation = this.reputation + 1;
        this.save();
    }
}

module.exports = ReputationProfile;