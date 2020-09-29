import io from "socket.io-client";

export function connect() {
    let socket;
    try {
        socket = window.location.hostname === 'localhost'
            ? io('http://localhost:5000/2048')
            : io("/2048");
    } catch (e) {
        console.log('connection error', e)
    }

    return socket;
}


export function setupNetworkEvents(game, socket){
    socket.on('notification', (data)=>{
        console.log(`%cNotification%c ${data.message}`, 'color:black; background:yellow', 'color:#9c381c')
    })

    socket.on('rejected', (data)=>{
        console.log(`%cRejected%c ${data.reason}`, 'color:white; background:#605500', 'color:#9c381c')
    })

    socket.on('request_fails', (data)=>{
        console.log(`%cREQ FAILS%c ${data.message}`, 'color:white; background:red', 'color:#9c381c')
    })

    socket.on('joined', (data)=>{
        const me = data.users.find(u=>u.me);
        const opponent = data.users.find(u=>!u.me);

        if (me && me.data){
            game.setPrizeValue(me.data.amount * 2);
            game.setPlayerInfo(me.data);
        }

        if (opponent && opponent.data){
            game.setOpponentInfo(opponent.data)
        }

        game.setTimer(data.data.time || 60)


        console.log('joined',data);
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

    socket.on('match_result', (data)=>{
        console.log('match_result', data)
        game.showGameResult(data);
    })
}



