const express = require("express");
const socket = require("socket.io");
require('dotenv').config();
const PORT = process.env.PORT || 5000;
const app = express();
const Game2048 = require('./src/games/2048/Game2048');

const server = app.listen(PORT, ()=>{
    console.log(`Listening on port ${PORT}`);
});

if (process.env.NODE_ENV === 'production'){
    app.use(express.static("../public"));
}

const io = socket(server);
Game2048.start(io)
