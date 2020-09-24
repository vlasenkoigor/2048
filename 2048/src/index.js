import * as PIXI from 'pixi.js'
import * as WebFont from 'webfontloader';
import io from 'socket.io-client';
import { Grid } from './components/Grid';
import { ScoreBoard } from './components/ScoreBoard';
import directions from './directions';
import {getUrlParams, random} from './utils'
import {GameOver} from "./components/GameOver";
const width = 1038 , height = 834;
const app = new PIXI.Application({
    width, height,
    backgroundColor: 0xFBF9ED,
    // resolution: window.devicePixelRatio || 1,
    resolution: window.devicePixelRatio || 1,
    antialias : true,
    forceCanvas : true
})
document.body.appendChild(app.view);

const {stage, loader} = app;

const urlParams = getUrlParams(window.location.search);
const user_id = urlParams.user_id || 'anonymous';
const room_id = urlParams.room_id || null;
const hash = urlParams.hash || '';


loader.add('layout','/assets/layout.json');
loader.add('AutoPlay','/assets/AutoPlay.png');
loader.load((_, resources)=>{
    WebFont.load({
        google: {
            families: ['Barlow']
        },
        active : ()=>{
            startApp(resources);
        }
    });

})

let socket;
let opponetMovesQueue = [];
let opponentQueuePlaying = false;
const startApp = (resources)=>{

    try{
        console.log('connecting to the server')
        socket = io("/2048");
        // socket = io('http://localhost:5001/2048');

        socket.emit('join_game', {
            user_id,
            room_id,
            hash
        });

        console.log('waiting for players');


        socket.on('rejected', (data)=>{
            console.log('rejected', data);
        })

        socket.on('joined', (data)=>{
            console.log('joined',data);
        })

        socket.on('opponent_joined', (data)=>{
            console.log('opponent_joined',data);
        })

        socket.on('opponent_disconnected', (data)=>{
            console.log('opponent_disconnected',data);
        })

        socket.on('start_game', ()=>{
            console.log('start game ')
            startGame();
        });

        socket.on('initial_cells', (cells)=>{
            setInitialOpponentCells(cells);
        });

        socket.on('move', (data)=>{
            moveOpponent(data)
        });

        socket.on('match_result', (data)=>{
            console.log('match_result', data)
            showGameResult(data);
        });

    } catch (e) {
        debugger
    }

    const layout = resources.layout.data;

    const {cellSize, vGap, hGap, userGridPos, opponentGridPos,
        scoreBoardPos, OpponentScoreBoardPos} = layout;


    let enabled = false;
    let score = 0;

    // uer grid
    const grid = new Grid(4, 4, cellSize, vGap, hGap);
    grid._name = 'my grid';
    stage.addChild(grid);
    grid.x = userGridPos.x;
    grid.y = userGridPos.y;

    // opponent grid
    const opponentGrid = new Grid(4, 4, cellSize, vGap, hGap);
    grid._name = 'opponentGrid'
    stage.addChild(opponentGrid);
    opponentGrid.x = opponentGridPos.x;
    opponentGrid.y = opponentGridPos.y;


    const scoreboard = new ScoreBoard();
    stage.addChild(scoreboard);
    scoreboard.x = scoreBoardPos.x;
    scoreboard.y = scoreBoardPos.y;


    const opponentScoreboard = new ScoreBoard(0xBBAE9E);
    stage.addChild(opponentScoreboard);
    opponentScoreboard.x = OpponentScoreBoardPos.x;
    opponentScoreboard.y = OpponentScoreBoardPos.y;


    const gameOver = new GameOver(()=>{startGame()});
    stage.addChild(gameOver);
    gameOver.x = width / 2;
    gameOver.y = height /2;

    const setInitialOpponentCells = (cells)=>{
        cells.forEach((cell)=>{
            opponentGrid.addCell(...cell)
        })
    }

    const startGame = ()=>{
        grid.reset();
        opponentGrid.reset();
        enabled = true;
        score = 0;
        scoreboard.reset();
        opponentScoreboard.reset();


        const initialCells = [];

        for (let i = 0; i < 2; i++){
            const cell = generateNextCell(2, grid);
            grid.addCell(...cell);
            initialCells.push(cell);
        }

        socket.emit('initial_cells', initialCells);
    }

    const move = direction =>{
        if (!enabled) return;
        enabled = false;

        const {data, promise} = grid.move(direction);
        const {hasMove, stepScore, previousCellsIds, currentCellsIds} = data
        score += stepScore;

        let nextRandIndex, nextCellValue;
        if (hasMove){
            [nextRandIndex, nextCellValue] = generateNextCell(null, grid);
        }

        socket.emit('move', {direction, hasMove, stepScore, previousCellsIds, currentCellsIds, score, nextRandIndex, nextCellValue});

        promise
            .then(()=>{
                enabled = true;
                if (hasMove){
                    grid.addCell(nextRandIndex, nextCellValue);
                    scoreboard.setValue(score);
                    if (!grid.hasAnyMove()){
                        showGameOver();
                        enabled = false;
                    }
                }
            })
    }

    const moveOpponent = (data)=>
    {

        // opponetMovesQueue.unshift(data);
        opponetMovesQueue = [data]
        proceedMovesQueue();
        // if (!opponentQueuePlaying){
        //     proceedMovesQueue();
        // }
    }

    function proceedMovesQueue(){
        // console.log('proceedMovesQueue', opponetMovesQueue)
        const data = opponetMovesQueue.pop();
        const {direction, hasMove, stepScore, previousCellsIds, currentCellsIds, score, nextRandIndex, nextCellValue} = data;
        const {promise} = opponentGrid.moveDemo(direction, previousCellsIds);

        opponentQueuePlaying = true;
        promise
            .then(()=>{
                opponentScoreboard.setValue(score);
                if (hasMove){
                    console.log('proceedMovesQueue addCell', opponetMovesQueue.length)
                    opponentGrid.addCell(nextRandIndex, nextCellValue);
                }
            })
            // .then(()=>{
            //     if (opponetMovesQueue.length > 0) {
            //         proceedMovesQueue()
            //     } else {
            //         opponentQueuePlaying = false;
            //     }
            // })
    }

    const generateNextCell = (value, grid) =>{
        const optionsIndexes = grid.getOptionsIndexes();
        const randNumber = random(0, optionsIndexes.length-1);
        const randIndex = optionsIndexes[randNumber];

        value = value || [2,4][random(0,1)]
        return [randIndex, value]
    }

    const showGameOver = ()=>{
        socket.emit('game_over', {score})
        gameOver.visible = true;
        gameOver.setInfoText();
    }

    const showGameResult = (data) => {
        const {result, score, opponentScore} = data;
        gameOver.setGameResultText(result, score, opponentScore)
    }


    window.addEventListener("keydown", event => {
        const {keyCode} = event;

        switch (keyCode){
            case 37:
                move(directions.LEFT);
                break;
            case 38:
                move(directions.UP);
                break;
            case 39:
                move(directions.RIGHT)
                break;
            case 40:
                move(directions.DOWN)
                break;
            default :
                break;

        }
    });
}








