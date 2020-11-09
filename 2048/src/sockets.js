import io from "socket.io-client";

export function connect() {
    let socket;

    const options = {
        // timeout : 400,
        transports : ['websocket'],
        // reconnectionDelay : 500,
        // reconnectionDelayMax : 2000,
    }
    try {
        socket =
            (window.location.hostname === 'localhost' ||
            /^(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))\.(\d|[1-9]\d|1\d\d|2([0-4]\d|5[0-5]))$/.test(window.location.hostname)
            )
            // ? io(window.location.hostname  + ':5000/2048', options)
            ? io('https://game2048multiplayer.herokuapp.com/2048', options)
            : io("/2048", options);
    } catch (e) {
        console.log('connection error', e)
    }


    return socket;
}


export function setupNetworkEvents(game, socket){

    let reconnecting = false;

    socket.on("disconnect", function() {
        console.log("Disconnected");
        game.connectionLost();
    });

    socket.on("reconnect", function() {
        // do not rejoin from here, since the socket.id token and/or rooms are still
        // not available.
        console.log("Reconnecting", game.gameStarted , game.isGameCompleted);
        reconnecting = true;
        if (game.gameStarted && !game.isGameCompleted){
            game.join();
        }
        game.connectionBackAlive();
        console.log("Reconnecting");
    });


    socket.on('notification', (data)=>{
        console.log(`%cNotification%c ${data.message}`, 'color:black; background:yellow', 'color:#9c381c')
    })

    socket.on('rejected', (data)=>{
        console.log(`%cRejected%c ${data.reason}`, 'color:white; background:#605500', 'color:#9c381c')
    })

    socket.on('game_error', (data)=>{
        const {code, message} = data;
        console.log('game_error', `Code: ${code}, message: ${message}`)
        game.onGameError(code, message);
    })


    socket.on('request_fails', (data)=>{
        console.log(`%cREQ FAILS%c ${data.message}`, 'color:white; background:red', 'color:#9c381c')
    })

    socket.on('joined', (e)=>{
        console.log('joined',e);
        const me = e.users.find(u=>u.me);
        const opponent = e.users.find(u=>!u.me);

        const name = 'Name LastName',
            photo = 'data:image/jpeg;base64,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',
            location = 'ukraine',
            location_img = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAARMAAAC3CAMAAAAGjUrGAAAAD1BMVEUadc/32xcAcNSjrYn93gA3NDSCAAAAzUlEQVR4nO3QsQGAMAzAsBT4/2b2eO0onaAZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAACASx62ednmY5vD5qSclJNyUk7KSTkpJ+WknJSTclJOykk5KSflpJyUk3JSTspJOSkn5aSclJNyUk7KSTkpJ+WknJSTclJOykk5KSflpJyUk3JSTspJOSkn5aSclJNyUk7KSTkpJ+WknJSTclJOykk5KSflpJyUk3JSTspJOSkn5aSclJNyUk7KSTkpJ+WknJSTclJOykk5KSflpH7zk2pa0LCuDAAAAABJRU5ErkJggg=='

        const testUser = {user : {name, photo, location, location_img} }
        if (me && me.data){
            let currency;

            if (me.data.game){
                currency = me.data.game.wallet;
            }
            game.setPrizeValue(me.data.amount * 2, currency);
            game.setPlayerInfo(me.data);
        } else {
            game.setPrizeValue(100000, 1);
            game.setPlayerInfo(testUser);
        }


        if (opponent && opponent.data) {
            game.setOpponentInfo(opponent.data)
        }

        const stopCell = e.data.stopCell || 2048;


        game.stopCell = stopCell;

        if (e.data.gameStarted){
            game.restoreGame(e.data);
        } else {
            const totalTime = e.data.totalTime || 60;
            const elapsedTime = e.data.elapsedTime || 0;
            game.setUpTimer(totalTime, elapsedTime);
        }

        if (reconnecting){
            game.gameRejoined();
        }
        reconnecting = false;
    })

    socket.on('opponent_joined', (data)=>{
        console.log('opponent_joined',data);
        const opponent = data.users.find(u => u.id === data.user_id);
        if (opponent && opponent.data){
            game.setOpponentInfo(opponent.data)
        }
    })

    socket.on('opponent_disconnected', (data)=>{
        console.log('opponent_disconnected',data);
    })

    socket.on('start_game', ()=>{
        console.log('start game ')
        game.startGame();
    });

    socket.on('initial_cells', (cells)=>{
        game.setInitialOpponentCells(cells);
    });

    socket.on('move', (data)=>{
        game.moveOpponent(data)
    });

    socket.on('opponent_game_over', (data)=>{
        console.log('opponent_game_over', data)
        game.showOpponentPopup(data.score);
    })

    socket.on('match_result', (data)=>{
        console.log('match_result', data)
        game.showGameResult(data);
    })

     const events =    [
        'error',
            'connect_error',
            'connect_timeout',
            'reconnect_attempt',
            'reconnecting',
            'reconnect_error',
            'reconnect_error',
            'ping',
            'pong'
        ]

    events.forEach( eventName => {
        socket.on(eventName, (p1) =>{
            if (typeof p1 === 'object'){
                p1 = [
                    p1.name, p1.type, p1.message,
                ].join(',')
            }
            console.log('event:', eventName, p1);
        })
    })
}



