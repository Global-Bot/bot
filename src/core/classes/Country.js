const Base = require("./Base")

class Country extends Base {
    constructor(user_id) {
        super();

        this.id = user_id;
    }





    async fetch() {
        return await this.models.country.findOne({ where: { user: this.id }, raw: true }) || await this.models.country.create({ user: this.id });
    }
    
    async update(row) {
        await this.fetch();
        return await this.models.country.update(row, { where: { user: this.id }, raw: true });
    }
    




    async get() {
        return await this.fetch().then(user => user.country);
    }

    async set(country) {
        await this.update({ country });
        return this.get();
    }
}

module.exports = Country;
