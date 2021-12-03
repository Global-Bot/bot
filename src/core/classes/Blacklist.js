const Base = require("./Base")

class Blacklist extends Base {
    constructor(user_id) {
        super();

        this.id = user_id;
    }





    async fetch() {
        return await this.models.blacklist.findOne({ where: { user: this.id }, raw: true }) || await this.models.blacklist.create({ user: this.id });
    }
    
    async update(row) {
        await this.fetch();
        return await this.models.blacklist.update(row, { where: { user: this.id }, raw: true });
    }
    




    async get() {
        return await this.fetch().then(user => user.blacklisted);
    }

    async set(blacklisted) {
        await this.update({ blacklisted });
        return this.get();
    }

    async add() {
        return await this.set(true);
    }

    async take() {
        return await this.set(false);
    }
}

module.exports = Blacklist;
