function chunkArray(inputArray, perChunk = 2) {    
    return inputArray.reduce((resultArray, item, index) => { 
        const chunkIndex = Math.floor(index/perChunk)
        
        if(!resultArray[chunkIndex]) {
            resultArray[chunkIndex] = []
        }
        
        resultArray[chunkIndex].push(item)
        
        return resultArray
    }, [])
}

module.exports = chunkArray;
