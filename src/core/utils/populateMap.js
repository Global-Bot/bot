function populateMap(entries) {
    const map = new Map();
    entries.forEach(entry => {
        if (typeof entry == 'string') {
            map.set(entry, entry);
        } else if (typeof entry == 'object') {
            map.set(entry.key, entry.value || true);
        }
    });

    return map;
}

module.exports = populateMap;
