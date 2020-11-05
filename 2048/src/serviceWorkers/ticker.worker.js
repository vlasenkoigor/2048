let uuid = null;
onmessage = function(e) {
    const {data : eventName} = e;

    if (eventName === 'start'){
        start();
    }

    if (eventName === 'stop'){
        stopTimer();
    }

}

function start() {
    uuid = setInterval(()=>{
        postMessage('tick');
    }, 1000)
}


function stopTimer() {
    if (uuid){
        clearInterval(uuid);
        uuid = null;
    }
}
