const Base = require("./Base")

class Gender extends Base {
    constructor(user_id) {
        super();

        this.id = user_id;
    }





    async fetch() {
        return await this.models.gender.findOne({ where: { user: this.id }, raw: true }) || await this.models.gender.create({ user: this.id });
    }
    
    async update(row) {
        await this.fetch();
        return await this.models.gender.update(row, { where: { user: this.id }, raw: true });
    }
    




    async get() {
        return await this.fetch().then(user => user.gender);
    }

    async set(gender) {
        await this.update({ gender });
        return this.get();
    }
}

module.exports = Gender;
