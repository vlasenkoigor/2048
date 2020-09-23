const messages = require('./protocol/messages/index');
const types = require('./protocol/types');
const rules = require('./rules');
const provider = require('./provider/provider');
const Player = require('./Player.js');
const gamesHash = {};

let io = null;

class Game2048 {

    constructor(room_id) {
        this._room_id = room_id;

        this.gameStarted = false;

        this.gameCompleted = false;

        this._players = [];

        /**
         * result : 'winner', 'drawn'
         * @type {String}
         * @private
         */
        this._result = '';

        /**
         * winner of the game
         * @type {null|Player}
         * @private
         */
        this._winner = null;

        /**
         * loser of the game
         * @type {null|Player}
         * @private
         */
        this._loser = null;
    }

    /**
     * register user on the game
     * @param socket
     * @param user_id
     */
    registerUser(socket, user_id) {

        // reject if game already started
        if (this.gameStarted){
            socket.emit(types.REJECTED, messages.rejected(this._room_id, 2));
            console.log(messages.rejected(this._room_id, user_id, 2));
            return;
        }

        // reject if game reached players limit
        if (this._players.length === rules.players_limit && !this._findPlayer(user_id)) {
            socket.emit(types.REJECTED, messages.rejected(this._room_id, user_id, 1));
            console.log(messages.rejected(this._room_id, user_id, 1));
            return;
        }

        // check if user already active and waits for the game gets started
        const player = this._findPlayer(user_id);

        // is player already connected
        // we reject socket
        if (player && player.active){
            socket.emit(types.REJECTED, messages.rejected(this._room_id, user_id, 3));
            console.log(messages.rejected(this._room_id, user_id, 3));
            return;

        } else if (player && !player.active){
            // check if player disconnected and trying to reconnect
            player.activate(socket);
            this._onUserJoined(socket, user_id, true);
        }

        // if player was not connected - to create the user
        if (!player){
            this._players.push(new Player(user_id, socket));
            this._onUserJoined(socket, user_id, false);
        }

        this._printUsers();
        // if we have all players in the game - start the game
        if (this._getActivePlayers().length === rules.players_limit) this.startGame();
    }

    /**
     * un user joined
     * @param socket
     * @param user_id
     * @param reconnected
     * @private
     */
    _onUserJoined(socket, user_id, reconnected = false){
        const room_id = this._room_id;

        socket.join(room_id);
        socket.emit(types.JOINED, messages.joined(user_id, room_id, reconnected, this._getUsersListInfo()));
        socket
            .to(this._room_id).broadcast
            .emit(types.OPPONENT_JOINED, messages.joined(user_id, room_id, reconnected, this._getUsersListInfo()));

        // subscribe to the disconnect event
        socket.on(types.DISCONNECT, ()=>{
            this._onDisconnect(socket);
        });

        this._setupGameListeners(socket);

        console.log(messages.joined(user_id, room_id, reconnected));
    }

    /**
     * find player
     * @param user_id
     * @return {*}
     * @private
     */
    _findPlayer(user_id){
        return this._players.find(p => p.id === user_id);
    }

    /**
     * on user disconnected (before game started)
     * @param socket
     * @private
     */
    _onDisconnect(socket){
        const player = this._players.find(p => p.getSocketId() === socket.id);

        if (player){
            // deactivate user and send broadcast notification
            player.deactivate();
            socket
                .to(this._room_id).broadcast
                .emit(types.OPPONENT_DISCONNECTED, messages.disconnected(player.id, this._room_id, this._getUsersListInfo()));

        }

        console.log(messages.disconnected(player.id, this._room_id, this._getUsersListInfo()));
        this._printUsers();
    }

    /**
     * get active users
     * @return {*[]}
     * @private
     */
    _getActivePlayers(){
        return this._players.filter(p => p.active === true)
    }

    /**
     * if all player are there we start the game
     */
    startGame(){
        console.log(`game #${this._room_id} could be started`);
        this._printUsers();

        this.gameStarted = true;
        io.to(this._room_id).emit(types.START_GAME)
    }

    /**
     * set up listeners for socket
     * @param socket
     * @private
     */
    _setupGameListeners(socket){
        // when we got initial cells from socket we need
        // broad cast them to all players
        socket.on(types.INITIAL_CELLS, (data)=>{
            socket.to(this._room_id).broadcast
                .emit(types.INITIAL_CELLS, data);
        });

        // on player moved
        socket.on(types.MOVE, data => {this._onPlayerMoved(socket, data)});

        // on game over. once timer implemented it will be removed
        socket.on(types.GAME_OVER, data => {this._onGameOver(socket, data)});
    }

    /**
     * on player moved
     * @param socket
     * @param data
     * @private
     */
    _onPlayerMoved(socket, data) {
        socket.to(this._room_id).broadcast
            .emit(types.MOVE, data);
    }

    /**
     * on player got game over
     * once timer implemented it will be removed
     * @param socket
     * @param data
     * @private
     */
    _onGameOver(socket, data){
        // todo - build hash of players by socket id;
        const player = this._players.find(p => p.getSocketId() === socket.id);
        const {score} = data;

        player.score = score;
        player.completeGame();

        const player1 = this._players[0];
        const player2 = this._players[1];

        // if both players completed to play
        if (player1.gameover && player2.gameover){
            this.gameCompleted = true;

            // define result
            this._defineResult();

            // send messages depends on result
            if (this._result === 'drawn'){
                this._sendDrawnMessage();
            } else {
                this._sendWinnerMessage();
                this._sendLoserMessage();
            }
        }
    }

    /**
     * send message that game is drawn
     * @private
     */
    _sendDrawnMessage(){
        const player1 = this._players[0];
        const player2 = this._players[1];

        player1.socket
            .emit(types.MATCH_RESULT, messages.match_result(this._result, player1.score, player2.score));
        player2.socket
            .emit(types.MATCH_RESULT, messages.match_result(this._result, player2.score, player1.score));
    }

    /**
     * send message to the winner
     * @private
     */
    _sendWinnerMessage(){
        this._winner.socket
            .emit(types.MATCH_RESULT, messages.match_result('win', this._winner.score, this._loser.score));
    }

    /**
     * send message to the loser
     * @private
     */
    _sendLoserMessage(){
        this._loser.socket
            .emit(types.MATCH_RESULT, messages.match_result('lose', this._loser.score, this._winner.score));
    }

    /**
     * define game result
     * @private
     */
    _defineResult(){
        const player1 = this._players[0];
        const player2 = this._players[1];

        // if we have drawn
        if (player1.score === player2.score){
            console.log(`Game #${this._room_id} result = DRAWN`)
            this._result = 'drawn';
            this._winner = null;
        } else {

            // define the winner
            this._result = 'winner';
            if (player1.score > player2.score){
                this._winner = player1;
                this._loser = player2;
            } else {
                this._winner = player2;
                this._loser = player1;
            }

            console.log(`Game #${this._room_id} result: WINNER user id ${this._winner.id}`)
            console.log(`Game #${this._room_id} result: LOSER user id ${this._loser.id}`)
        }
    }

    /**
     * get users array contains user info
     * @return {string[]}
     * @private
     */
    _getUsersListInfo(){
        return this._players.map(p => p.getInfo())
    }

    /**
     * console.log of users in the room
     * @private
     */
    _printUsers(){
        console.log(`room #${this._room_id}`, this._getUsersListInfo())
    }

    /**
     * get game instance according to the room id
     * @param room_id
     */
    static getGame(room_id = 'default'){
        if (!gamesHash[room_id]) {
            gamesHash[room_id] = new Game2048(room_id);
        }

        return gamesHash[room_id]
    }

    /**
     * start serving namespace /2048
     * @param global_io - global connection
     */
    static start(global_io){
        io = global_io.of(Game2048.gameNameSpace);

        io.on(types.CONNECTION, (socket)=>{
            console.log(`socket # ${socket.id} connected to /2048 namespace`)

            // wait till client sends join_game event
            socket.on(types.JOIN_GAME, (data)=>{
                let {user_id, room_id, hash} = data;
                room_id = room_id || Game2048.defaultRoom;

                provider.validate_game({
                    user_id,
                    room_id,
                    hash
                },()=>{

                } , ()=>{

                } );

                const game = Game2048.getGame(room_id);

                game.registerUser(socket, user_id);
            })
        })
    }
}

Game2048.gameNameSpace = '/2048';
Game2048.defaultRoom = '2048_default';

module.exports = Game2048;
