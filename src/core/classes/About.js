const Base = require("./Base")

class About extends Base {
    constructor(user_id) {
        super();

        this.id = user_id;
    }





    async fetch() {
        return await this.models.about.findOne({ where: { user: this.id }, raw: true }) || await this.models.about.create({ user: this.id });
    }
    
    async update(row) {
        await this.fetch();
        return await this.models.about.update(row, { where: { user: this.id }, raw: true });
    }
    




    async get() {
        return await this.fetch().then(user => user.about);
    }

    async set(about) {
        await this.update({ about });
        return this.get();
    }
}

module.exports = About;
