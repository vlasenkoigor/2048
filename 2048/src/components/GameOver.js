import {Container, Text} from 'pixi.js'
export class GameOver extends Container{

    constructor(onClick = ()=>{}) {
        super();

        const tf = new Text('Game Over', textStyle);
        tf.anchor.set(.5);
        this.addChild(tf);


        this.interactive = true;
        this.on('pointerdown ', this._onClick.bind(this))
        this.on('click', this._onClick.bind(this))

        this._onClickHandler = onClick;

        this.visible = false;

    }

    _onClick(){
        this.visible = false;
        this._onClickHandler();
    }
}


const textStyle = {
    fill : '#ffffff',
    fontSize: 150,
    fontWeight : 'bold',
    "lineJoin": "round",
    "stroke": "#6A5F60",
    "strokeThickness": 20
}
