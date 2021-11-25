const Base = require("./Base")

class Inventory extends Base {
    constructor(user_id) {
        super();
        this.id = user_id;
        this.contents = [];
        return (async () => {
            let getInvData = await this.fetch();
            if (!Array.isArray(getInvData)) {
                this.errored = true;
            } else {
                for (const item of getInvData) {
                    this.contents.push(item);
                }
            }
            return this;
        })()
    }
    
    async fetch() {
        return await this.models.inventory.findAll({ where: { user: this.id }, raw: true });
    }
    
    getItemsByName(name) {
        return this.contents.filter(item => item.itemID.toLowerCase() == name.toLowerCase());
    }
    
    getItemsByNameAndType(name, type) {
        let items = this.getItemsByName(name);
        if (type) {
            items = items.filter(item => item.type == type);
        }
        
        return items;
    }
    
    quantity(name, type) {
        if (!name) return 0;
        
        const items = this.getItemsByNameAndType(name, type);
        const quantity = items.reduce((prev, curr) => prev + curr.quantity, 0);
        
        return quantity;
    }
    
    has(name, type) {
        if (!name) return false;
        
        const items = this.getItemsByNameAndType(name, type);
        
        return items.length > 0;
    }
    
    get(...args) {
        return this.getItemsByNameAndType(...args)[0] || null;
    }
    
    async save() {
        let inventory = await this.fetch();
        if (!Array.isArray(inventory)) { this.errored = true }
        
        for (const item of inventory) {
            const where = { user: this.id, itemID: item.itemID, type: item.type };

            if (this.has(item.itemID, item.type)) {
                if (this.quantity(item.itemID, item.type) != item.quantity) {
                    await this.models.inventory.update(this.get(item.itemID, item.type), { where, raw: true });
                } else {
                    continue;
                }
            } else {
                await this.models.inventory.destroy({ where, raw: true })
            }
        }

        const addedItems = this.contents.filter(item => !inventory.some(i => i.itemID == item.itemID && i.type == item.type));
        for (const item of addedItems) {
            await this.models.inventory.create({ user: this.id, itemID: item.itemID, quantity: item.quantity, type: item.type, inUse: false });
        }

        return true;
    }
    
    async set(name, type, quantity) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;

        const items = this.contents.filter(item => !(item.itemID == name && item.type == type));
        if (quantity >= 1) {
            items.push({ itemID: name, quantity, type });
        }
        
        this.contents = items;
        await this.save();
        
        return this.contents;
    }
    
    async add(name, type, quantity) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;

        quantity = this.quantity(name, type) + quantity;
        if (quantity > Number.MAX_SAFE_INTEGER) quantity = Number.MAX_SAFE_INTEGER;
        
        return await this.set(name, type, quantity)
    }
    
    async take(name, type, quantity) {
        quantity = parseFloat(quantity);
        if (isNaN(quantity)) return this.contents;
        
        quantity = this.quantity(name, type) - quantity;
        if (quantity < 0) quantity = 0;
        
        return await this.set(name, type, quantity)
    }

    async clear() {
        this.contents = [];
        return await this.save();
    }
}

module.exports = Inventory;