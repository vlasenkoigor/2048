export const random = (min, max) => {
    let rand = min - 0.5 + Math.random() * (max - min + 1);
    return Math.abs(Math.round(rand));
  }

export const forEach = (array, reversed = false, callback) => {
    if (!reversed){
        for (let i = 0, len = array.length; i < len; i++){
            callback(array[i], i);
        }
    } else {
        for (let i = array.length-1; i >= 0; i--){
            callback(array[i], i);
        }
    }
}

export const arrayEquals = (a, b)=>{
    return Array.isArray(a) &&
      Array.isArray(b) &&
      a.length === b.length &&
      a.every((val, index) => val === b[index]);
}

export const generateArray = (len = 1, fill = null) => {
    return new Array(len).fill(fill)
}


export const getUrlParams = (search) => {
    const hashes = search.slice(search.indexOf('?') + 1).split('&')
    const params = {}
    hashes.map(hash => {
        const [key, val] = hash.split('=')
        params[key] = decodeURIComponent(val)
    })
    return params
}

