// Array.random - Returns a random index 
Array.prototype.random = function() {
    return this[Math.floor((Math.random() * this.length))];
};
