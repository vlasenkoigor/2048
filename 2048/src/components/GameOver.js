import {Container, Text} from 'pixi.js'
export class GameOver extends Container{

    constructor(onClick = ()=>{}) {
        super();

        const tf = new Text('Game Over', textStyle);
        tf.anchor.set(.5);
        this._tf = tf;
        this.addChild(tf);



        this.interactive = true;
        this.on('pointerdown ', this._onClick.bind(this))
        this.on('click', this._onClick.bind(this))

        this._onClickHandler = onClick;

        this.visible = false;

        this.setGameResultText();
    }

    setInfoText(){
        this._tf.text = 'Game Over\nWaiting for the opponent\ncomplete the game'
    }

    setGameResultText(result = 'win', yourScore = 0, opponentScore = 0){

        this._tf.text =
`${result === 'drawn' ? 'Drawn!' : `You ${result === 'win' ? 'win!' : 'lose!'}` }
Your score : ${yourScore}
Opponent score : ${opponentScore}
`

    }

    _onClick(){
        // this.visible = false;
        // this._onClickHandler();
    }
}


const textStyle = {
    fill : '#ffffff',
    fontSize: 70,
    fontWeight : 'bold',
    "lineJoin": "round",
    "align": "center",
    "stroke": "#6A5F60",
    "strokeThickness": 20
}
