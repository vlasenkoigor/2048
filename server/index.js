const express = require("express");
const socket = require("socket.io");
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();
const server = app.listen(PORT, function () {
    console.log(`Listening on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

let players = [];


console.log(process.env.NODE_ENV, process.env.NODE_ENV === "production", typeof process.env.NODE_ENV)
if (process.env.NODE_ENV === 'production'){
    app.use(express.static("../public"));
}

// Socket setup
const io = socket(server);
let gamaStarted = false;
io.on("connection", function (socket) {
    console.log('user connected')
    if (players.length === 2) {
        socket.emit('nopass', 'only 2 players can play ')
        return ;
    }

    players.push({
        id : socket.id,
        socket : ()=>{return socket},
        lastMove : null
    });
    console.log(socket.id)

    socket.emit('gameInfo', players)

    if (players.length === 2){
        io.emit('startGame');
        gamaStarted = true;
    }

    socket.on('initialCells', (cells)=>{
        socket.broadcast.emit('initialCells', cells);
    })

    socket.on('move', (data)=>{
        console.log('player', socket.id, 'moved');
        socket.broadcast.emit('move', data);
    })

    socket.on('gameOver', (score)=>{
        const player = players.find(p => p.id === socket.id);
        player.score = score;
        player.isGameOver = true;

        const player1 = players[0];
        const player2 = players[1];

        console.log('game over')
        if (player1.isGameOver && player2.isGameOver){
            if (player1.score > player2.score){
                player1.socket().emit('match_result', {result : "win", score : player1.score})
                player2.socket().emit('match_result', {result : "lose", score : player2.score})
            } else if (player2.score > player1.score){
                player2.socket().emit('match_result', {result : "win", score : player2.score})
                player1.socket().emit('match_result', {result : "lose", score : player1.score})
            } else if (player1.score === player2.score){
                player2.socket().emit('match_result', {result : "drawn", score : player2.score})
                player1.socket().emit('match_result', {result : "drawn", score : player1.score})
            }
        }
    })

    socket.on('disconnect', () => {
        players = players.filter(p => p.id!== socket.id)
        console.log('user disconnected');
        socket.broadcast.emit('playerDisconnected')
    });

});
