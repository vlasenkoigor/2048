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
        id : socket.id
    });
    console.log(socket.id)

    if (players.length === 2){
        io.emit('startGame');
        gamaStarted = true;
    }

    socket.on('initialCells', (cells)=>{
        socket.broadcast.emit('initialCells', cells);
    })

    socket.on('move', (data)=>{
        socket.broadcast.emit('move', data);
    })

    socket.on('gameOver', (score)=>{
        const player = players.find(p => p.id === socket.id);
        player.score = score;
    })

    socket.on('disconnect', () => {
        players = players.filter(p => p.id!== socket.id)
        console.log('user disconnected');
    });

});
