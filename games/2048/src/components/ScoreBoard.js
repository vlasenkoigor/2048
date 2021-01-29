import {Container, Text, Graphics} from 'pixi.js'
export class ScoreBoard extends Container{

    constructor(layout, bgColor = 0x3d3b34, isMobile){
        super();

        const {width, height, radius,value, title, singleLine} = layout;

        this.singleLine = !!singleLine;

        this._bg = this._drawBackground(bgColor, width, height, radius);
        this.addChild(this._bg);

        if (!this.singleLine){
            this._labelTf = this._createLabel(title, isMobile);
            this.addChild(this._labelTf);
        }

        this._valueTf = this._createValue(value);
        this.addChild(this._valueTf   );

        this.x = layout.x;
        this.y = layout.y;
        this.reset();
    }

    reset(){
        this.setValue(0);
    }

    setValue(value){
        this._valueTf.text = this.singleLine ? `SCORE: ${value}` : value;
    }


    _drawBackground(bgColor, width, height, radius){
        // #3d3b34
        const g = new Graphics();
        g.beginFill(bgColor);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        g.cacheAsBitmap = true;
        return g;
    }


    _createLabel(layout, isMobile){
        const tf = new Text(isMobile ? 'Your Score' : 'SCORE', {
            fontFamily : "Fira Sans",
            fontSize : layout.fontSize || 20,
            fill: "#ffffff"
        });
        tf.x = layout.x;
        tf.y = layout.y;
        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y)
        }
        return tf;
    }

    _createValue(layout){
        const tf = new Text('0', {
            fontFamily : "Fira Sans",
            fontWeight : "bold",
            fontSize : layout.fontSize || 30,
            fill: "#ffffff"
        });
        // tf.x = 7;
        // tf.y = 33       ;
        tf.x = layout.x;
        tf.y = layout.y;
        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y)
        }
        return tf;
    }
}






