import {Grid} from "./components/Grid";
import {ScoreBoard} from "./components/ScoreBoard";
import {GameOver} from "./components/GameOver";
import * as PIXI from "pixi.js";
import {Timer} from "./components/Timer";
import {PlayerInfo} from "./components/PlayerInfo";
import {random} from "./utils";
import directions from "./directions";
import {connect, setupNetworkEvents} from "./sockets";
import {getParameters} from "./urlParameters";
import {Logo} from "./components/Logo";
import {SurrenderButton} from "./components/SurrenderButton";
import {TopBar} from "./components/TopBar";
import {Online} from "./components/Online";
import {InfoText} from "./components/InfoText";
import {GameOverPopup} from "./components/GameOverPopup";
import {MobileGridBackground} from "./components/MobileGridBackground";

import {SwipeGesture} from "./SwipeGesture";
import {ErrorPopup} from "./components/ErrorPopup";
export class Game {

    constructor(width, height,) {

        /**
         * game's root stage
         * @type {null}
         */
        this.stage = null;

        this.width = width;

        this.height = height;

        /**
         * player score
         * @type {number}
         */
        this.score = 0;

        /**
         * is time out
         * @type {boolean}
         */
        this.timeout = false;

        /**
         * is game over for the player
         * @type {boolean}
         */
        this.isGameOver = false;

        this.isGameCompleted = false;

        this.gameStarted = false;


        /**
         * is enables state to move
         * @type {boolean}
         */
        this.enabled = false;

        /**
         * player grid
         * @type {null|Grid}
         */
        this.grid = null;

        /**
         * opponent grid
         * @type {null|Grid}
         */
        this.opponentGrid = null;

        /**
         * player scoreboard
         * @type {null|ScoreBoard}
         */
        this.scoreboard = null;

        /**
         * opponent scoreboard
         * @type {null|ScoreBoard}
         */
        this.opponentScoreboard = null;

        /**
         *
         * @type {null|GameOver}
         */
        this.gameOverPopup = null;

        /**
         * surrender button
         * @type {null|SurrenderButton}
         */
        this.surrenderButton = null;

        /**
         *
         * @type {null|Timer}
         */
        this.timer = null;


        this.socket = this.connectTheSerer();

        this.movePromise = Promise.resolve();

        this.didOpponentCompleteGame = false;

        this.isSinglePlay = false;

        /**
         * will be set from outside
         * socket.js
         * @type {number}
         */
        this.stopCell = 2048;

        this.errorShown = false;

    }


    /**
     * build UI
     * @param stage
     * @param resources
     */
    build(stage, resources, isMobile){
        const layout = resources.layout.data;
        this.stage = stage;

        this.layout = layout;

        const {cellSize, vGap, hGap, userGridLayout, opponentGridLayout,
            scoreBoardPos, OpponentScoreBoardPos,
            vsLabelLayout, timerLayout, logoLayout,  surrenderLayout,
            topBarLayout, onlineLayout, infoTextLayout,
            gameOverPopupLayout,
            opponentGameOverPopupLayout, errorPopupLayout,
            opponentGridBgLayout
        } = layout;

        if (isMobile){
            const mobBg = new MobileGridBackground(opponentGridBgLayout);
            stage.addChild(mobBg);
        }

        const topBar = new TopBar(topBarLayout);
        stage.addChild(topBar);

        // player grid
        const grid = new Grid(4, 4, cellSize, vGap, hGap);
        stage.addChild(grid);
        grid.x = userGridLayout.x;
        grid.y = userGridLayout.y;
        if (userGridLayout.scale){
            grid.scale.set(userGridLayout.scale)
        }
        this.grid = grid;


        // opponent grid
        const opponentGrid = new Grid(4, 4, cellSize, vGap, hGap);
        stage.addChild(opponentGrid);
        opponentGrid.x = opponentGridLayout.x;
        opponentGrid.y = opponentGridLayout.y;
        if (opponentGridLayout.scale){
            opponentGrid.scale.set(opponentGridLayout.scale)
        }
        this.opponentGrid = opponentGrid;


        // score board
        const scoreboard = new ScoreBoard(scoreBoardPos, 0x3d3b34, isMobile);
        stage.addChild(scoreboard);
        this.scoreboard = scoreboard


        // opponent score board
        const opponentScoreboard = new ScoreBoard(OpponentScoreBoardPos,!isMobile ? 0xBBAE9E : 0x3d3b34, isMobile);
        stage.addChild(opponentScoreboard);
        this.opponentScoreboard = opponentScoreboard;


        // vs label
        if (!isMobile){
            const vsLabel = new PIXI.Text('VS', {
                fontFamily : 'Fira Sans',
                fontSize : 24,
                fill : '#AFACA2'
            });
            vsLabel.x = vsLabelLayout.x;
            vsLabel.y = vsLabelLayout.y;
            vsLabel.anchor.set(vsLabelLayout.anchor.x, vsLabelLayout.anchor.y)
            vsLabel.cacheAsBitmap = true;
            stage.addChild(vsLabel);
        }

        // timer
        const timer = new Timer(timerLayout);
        stage.addChild(timer);
        this.timer = timer;


        // logo
        const logo = new Logo(logoLayout);
        stage.addChild(logo);

        // surrender button
        const surrenderButton = new SurrenderButton(surrenderLayout, resources, this.quitGame.bind(this), isMobile)
        //
        stage.addChild(surrenderButton);
        surrenderButton.enable();
        this.surrenderButton = surrenderButton;




        const online = new Online(onlineLayout, isMobile);
        stage.addChild(online);

        if (!isMobile){
            const infoText = new InfoText(infoTextLayout);
            stage.addChild(infoText);
        }


        // game over pop up
        const gameOver = new GameOverPopup(gameOverPopupLayout);
        this.gameOverPopup = gameOver;
        stage.addChild(gameOver);


        // game over pop up
        const opponentGameOver = new GameOverPopup(opponentGameOverPopupLayout, true);
        this.opponentGameOver = opponentGameOver;
        stage.addChild(opponentGameOver);


        // error over pop up
        const errorPopup = new ErrorPopup(errorPopupLayout, true);
        this.errorPopup = errorPopup;
        stage.addChild(errorPopup);


        this.setupControllers();

        if (this.isSinglePlay){
            this.startGame();
        } else {
            this.join();
            this.setupNetworkEvents();
        }

    }

    join(){
        const {
            user_id,
            room_id,
            hash,
            ignoreProviderFails
        } = getParameters();

        console.log('join_game')
        this.socket.emit('join_game', {
            user_id,
            room_id,
            hash,
            ignoreProviderFails
        });
    }

    setUpTimer(time, elapsedTime){
        this.timer.setup(time, elapsedTime);
    }

    /**
     * set initial opponent cells
     * @param snapshot
     * @private
     */
    setInitialOpponentCells (snapshot){
        this.opponentGrid._syncCellsState(snapshot.board);
    }

    setPrizeValue(value){
        this.timer.setBankValue(value)
    }

    /**
     * add users info panels
     * @param data
     */
    setPlayerInfo (data){
        if (!this.playerInfo){
            const {stage, layout} = this;
            const {playerInfoLayout} = layout;

            // players info panels
            const playerInfo = new PlayerInfo(data, playerInfoLayout);
            stage.addChild(playerInfo);
            this.playerInfo = playerInfo;
        }
    }

    /**
     * add opponent info
     * @param data
     */
    setOpponentInfo(data){
        if (!this.opponentInfo){
            const {stage, layout} = this;
            const {opponentInfoLayout} = layout;
            const opponentInfo = new PlayerInfo(data, opponentInfoLayout);
            stage.addChild(opponentInfo);
            this.opponentInfo = opponentInfo;
        }
    }


    /**
     * start game
     */
    startGame(){
        const {grid, opponentGrid, scoreboard, opponentScoreboard} = this;

        console.log('start game')
        this.gameStarted = true;
        this.score = 0;
        this.timeout = false;
        this.isGameOver = false;
        this.isGameCompleted = false;
        this.didOpponentCompleteGame = false;
        this.gameOverPopup.hide();
        this.opponentGameOver.hide();
        this.movePromise = Promise.resolve();
        this.errorShown = false;

        grid.reset();
        opponentGrid.reset();

        scoreboard.reset();
        opponentScoreboard.reset();

        this.enable();

        for (let i = 0; i < 2; i++){
            const cell = Game.generateNextCell(2, this.grid);
            grid.addCell(...cell);
        }

        this.startTimer();

        this.socket.emit('initial_cells', this.getSnapshot());
    }

    startTimer(){
        this.timer.startCountDown(this.onTimeout.bind(this));
    }

    enable(){
        console.log('enable')
        this.enabled = true;
        this.surrenderButton.enable();
    }

    disable(){
        console.log('disable')
        this.enabled = false;
        this.surrenderButton.disable();
    }

    getSnapshot(board, score){
        return {
            board : board || this.grid.toIndexes(),
            score : score || this.score
        }
    }

    /**
     * player move
     * @param direction
     */
    move (direction){
        if (!this.enabled) return;

        window.movePromise = this.movePromise;
        this.grid.skip();
        this.movePromise = this.movePromise
            .then(()=>{
                const {data, promise} = this.grid.move(direction);
                const {hasMove, stepScore, cellsBefore, cellsAfter} = data
                this.score += stepScore;

                let nextRandIndex, nextCellValue;
                if (hasMove){
                    [nextRandIndex, nextCellValue] = Game.generateNextCell(null, this.grid);
                }

                const score = this.score;

                const board = cellsAfter;
                if (hasMove){
                    board[nextRandIndex] = nextCellValue;
                }

                const message = {
                    moveData : {direction, hasMove, stepScore, cellsBefore, cellsAfter,  nextRandIndex, nextCellValue},
                    snapshot : this.getSnapshot(board, score)
                }
                console.log('move', message)

                this.socket.emit('move', message);

                if (cellsAfter.some(s => s === this.stopCell)){
                    this.disable();
                }

                promise
                    .then(()=>{
                        if (hasMove){
                            this.grid.addCell(nextRandIndex, nextCellValue);
                            this.scoreboard.setValue(this.score);
                            if (!this.grid.hasAnyMove() && !this.isGameOver){
                                this.gameOver();
                            }
                        }
                    })

                return promise;
            })

    }



    /**
     * opponent move
     * @param data
     */
    moveOpponent (data) {
        this.opponentMove(data);
    }

    /**
     * proceed opponent move
     */
    opponentMove(data){
        const {direction, hasMove,  cellsBefore,  nextRandIndex, nextCellValue } = data.moveData;
        const {score} = data.snapshot;
        const {collectedStopper} = data;

        const {promise} = this.opponentGrid.moveDemo(direction, cellsBefore);

        promise
            .then(()=>{
                this.opponentScoreboard.setValue(score);
                if (hasMove){
                    this.opponentGrid.addCell(nextRandIndex, nextCellValue);
                }
            })

        if (collectedStopper){
            this.disable();
        }
    }


    /**
     * on time out
     */
    onTimeout(){
        this.timeout = true;
        if (this.isGameOver) return;
        this.gameOver(true);
    }

    quitGame(){
        this.gameOver(false);
    }

    /**
     * game over
     */
    gameOver(timesUp = false){

        this.sendGameOver(timesUp);
        this.isGameOver = true;
        this.showGameOver();
        this.disable();
    }

    sendGameOver(timesUp){
        const timeLeft = timesUp ? 0 : this.timer.timerValue;
        this.socket.emit('game_over', {score : this.score || 0, timeLeft});

    }

    /**
     * show game over
     */
    showGameOver (){
        this.gameOverPopup.show(this.score, !this.didOpponentCompleteGame);
    }

    /**
     * show game result
     * @param data
     */
    showGameResult(data) {
        this.isGameCompleted = true;
        this.disable();
        const {result, score, opponentScore, snapshot} = data;
        this.timer.stop(snapshot.timeLeft);
        this.syncUI(snapshot)
        this.showOpponentPopup(opponentScore);
        if (this.gameOverPopup.visible === false){
            this.gameOverPopup.show(score, false);
        } else {
            this.gameOverPopup.waitingVisibility(false);
        }

    }

    showOpponentPopup(score){
        this.opponentGameOver.show(score);
    }


    /**
     * set up controllers
     */
    setupControllers(){

        SwipeGesture.listen(this.grid, direction=>{
            this.move(direction);
        })


        window.addEventListener("keydown", event => {
            const {keyCode} = event;

            switch (keyCode){
                case 37:
                    this.move(directions.LEFT);
                    break;
                case 38:
                    this.move(directions.UP);
                    break;
                case 39:
                    this.move(directions.RIGHT)
                    break;
                case 40:
                    this.move(directions.DOWN)
                    break;
                default :
                    break;

            }
        });
    }

    connectTheSerer(){
        return connect();
    }


    setupNetworkEvents(){
        setupNetworkEvents(this, this.socket);
    }


    /**
     * restore game state after reloading
     * @param data
     */
    restoreGame(data){
        const {snapshot, opponentSnapshot , gameCompleted} = data;

        this.errorShown = false;
        console.log('restoreGame')
        this.syncUI(data);

        if (!snapshot) return;

        const score = snapshot ? snapshot.score : 0;
        const opponentScore =  opponentSnapshot ? opponentSnapshot.score : 0
        const gameOver =  snapshot ? snapshot.gameover : false
        const opponentGameOver =  opponentSnapshot ? opponentSnapshot.gameover : false

        this.score = score || 0;
        this.didOpponentCompleteGame = opponentGameOver || gameCompleted;
        this.gameStarted = !gameCompleted;

        if (gameCompleted){
            this.showGameOver();
            this.showOpponentPopup(opponentScore);
            this.timer.stop(data.timeLeft);
        } else {
            if (this.isGameOver){
                this.sendGameOver();
            } else {

                // resume timer
                this.startTimer();

                if (opponentGameOver){
                    this.showOpponentPopup(opponentScore);
                }

                if (gameOver){
                    // if player completed the game
                    // show pop up for him
                    this.showGameOver();

                    // and disable UI
                    this.disable();
                } else {
                    if (!this.isGameOver){
                        this.enable();
                    }
                }
            }

        }
    }

    syncUI(data){
        const {snapshot, opponentSnapshot} = data;
        if (!this.isGameCompleted){
            this.syncTimer(data);
        }
        this.syncPlayerBoard(snapshot);
        this.syncOpponentBoard(opponentSnapshot);
    }

    syncPlayerBoard(snapshot){
        if (!snapshot) return;
        const {board, score} = snapshot;
        if (board){
            this.grid.reset();
            this.grid._syncCellsState(board);
        }
        this.scoreboard.setValue(score || 0);
    }

    syncOpponentBoard(snapshot){
        if (!snapshot) return;
        const {board, score} = snapshot;
        if (board){
            this.opponentGrid.reset();
            this.opponentGrid._syncCellsState(board);
        }
        this.opponentScoreboard.setValue(score || 0);
    }

    syncTimer(data){
        const totalTime = data.totalTime || 60;
        const elapsedTime = data.elapsedTime || 0;
        this.setUpTimer(totalTime, elapsedTime);
    }


    onGameError(code, message){
        this.disable();
        this.errorShown = true;
        this.errorPopup.show(code, message);
        this.socket.disconnect();
        this.timer.stop();
    }

    connectionLost(){
        if (this.errorShown ) return;
        this.disable();
        this.errorPopup.show(
            null,
            "Connection Lost! "

        );

    }

    connectionBackAlive(){
        if (this.errorShown ) return;
        if (this.gameStarted && !this.isGameCompleted){
            this.errorPopup.show(
                null,
                "Reconnecting to the game... "
            );
        } else {
            this.errorPopup.hide();
        }
    }

    gameRejoined(){
        this.errorPopup.hide();
    }

    /**
     * generate cells
     * @param value
     * @param grid
     * @return {[*, *|number]}
     */
    static generateNextCell (value, grid){
        const optionsIndexes = grid.getOptionsIndexes();
        const randNumber = random(0, optionsIndexes.length-1);
        const randIndex = optionsIndexes[randNumber];

        if (!value){
            const chanceMap = {
                2 : 80,
                4 : 20
            };
            const rnd = random(0, 100);
            value = rnd <= chanceMap[2] ? 2 : 4;
        }
        return [randIndex, value]
    }

}
