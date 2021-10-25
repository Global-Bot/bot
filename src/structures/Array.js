// Array.random - Returns a random index 
Object.defineProperty(Array.prototype, "random", {
    get() { return () => this[ Math.floor(Math.random() * this.length) ] },
    enumerable: false,
});
