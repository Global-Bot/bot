module.exports = (max, min) => {
    return (Math.random() * (max - min + 1) + min).toFixed(3)
}