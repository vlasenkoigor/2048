class Player {
    constructor(id, socket) {
        this.id = id;

        /**
         * currently active socket user communicate through
         * @type {null|WebSocket}
         */
        this.socket = socket;

        /**
         * user
         * @type {number}
         */
        this.score = 0;

        /**
         * is user active or not
         * @type {boolean}
         */
        this.active = true;

        /**
         * user finished playing or not
         * @type {boolean}
         */
        this.gameover = false;
    }

    /**
     * make user activate
     * @param socket
     */
    activate(socket){
        this.active = true;
        this.socket = socket;
    }


    /**
     * deactivate user
     */
    deactivate(){
        this.active = false;
        this.socket = null;
    }

    /**
     * get socket id
     * @return {*}
     */
    getSocketId(){
        return this.socket ? this.socket.id : null;
    }

    /**
     * get info
     * @return {string}
     */
    getInfo(){
        return `id : ${this.id}, active : ${this.active ? 'true' : 'false'}, socketID : ${!this.socket ? 'null' : this.socket.id}`
    }

    /**
     * mark that user completed the game
     */
    completeGame(){
        this.gameover = true;
    }
}

module.exports = Player;
