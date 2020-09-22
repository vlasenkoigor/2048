import {Container, Text, Graphics} from 'pixi.js'
export class ScoreBoard extends Container{

    constructor(bgColor = 0x3d3b34){
        super();
        this._bg = this._drawBackground(bgColor);
        this.addChild(this._bg);

        this._labelTf = this._createLabel();
        this.addChild(this._labelTf);

        this._valueTf = this._createValue();
        this.addChild(this._valueTf   );
    }

    reset(){
        this.setValue(0);
    }

    setValue(value){
        this._valueTf.text = value;
    }


    _drawBackground(bgColor){
        // #3d3b34
        const g = new Graphics();
        g.beginFill(bgColor);
        g.drawRoundedRect(0,0,106, 72, 8);
        g.endFill();
        g.cacheAsBitmap = true;
        return g;
    }


    _createLabel(){
        const tf = new Text('SCORE', labelStyle);
        tf.x = 7;
        tf.y = 8;
        return tf;
    }

    _createValue(){
        const tf = new Text('0', valueStyle);
        tf.x = 7;
        tf.y = 33       ;
        return tf;
    }
}

const labelStyle = {
    fontFamily : "Barlow",
    fontSize : 20,
    fill: "#ffffff"
}


const valueStyle = {
    fontFamily : "Barlow",
    fontWeight : "bold",
    fontSize : 30,
    fill: "#ffffff"
}




