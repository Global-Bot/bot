class Collection extends Map {
    toArray() {
        return [ ...this.values() ];
    }

    filter(cb, thisArg) {
        return this.toArray().filter(cb, thisArg)
    }
    
    map(cb, thisArg) {
        return this.toArray().map(cb, thisArg)
    }
}

module.exports = Collection;
