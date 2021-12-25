const Base = require("../Base");

class ShopManager extends Base
{
    constructor(global)
    {
        super(global);
        
        this.database = this.db.models.shop;
    }

    get contents()
    {
        return new Promise(async resolve => resolve(await this.database.findAll({ raw: true })))
    }

    get count()
    {
        return new Promise(async resolve => resolve((await this.contents).length))
    }

    async has(itemID, type)
    {
        return (await this.contents).find(item => item.itemID == itemID && item.type == type);
    }

    async add(itemID, type, requiredLevel)
    {
        if (await this.has(itemID, type)) return false;

        return await this.database.create({ itemID, type, requiredLevel });
    }

    async take(itemID, type)
    {
        if (!await this.has(itemID, type)) return false;

        return await this.database.destroy({ where: { itemID, type } });
    }

    async clear()
    {
        return await this.database.destroy({ where: {} });
    }
}

module.exports = ShopManager;
