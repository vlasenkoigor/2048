
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