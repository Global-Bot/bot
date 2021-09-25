function groupArray(list, key) {
    return list.reduce(function(rv, x) {
        (rv[x[key]] = rv[x[key]] || []).push(x);
        return rv;
    }, {});    
}

module.exports = groupArray;
