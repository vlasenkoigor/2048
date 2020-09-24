import { Container, Graphics, Text} from "pixi.js";

const colors = [
    0xeee4da,
    0xeee1ce,
    0xf4b27e,
    0xf3976b,
    0xf07f68,
    0xee6047,
    0xefcd72,
    0xedca64,
    0xedc651,
    0xeec745,
    0xecc344
];

const blackStyle = {
    "fontFamily" : "Barlow",
    "fill": "#6e6e6e",
    "fontSize": 60,
    "fontWeight": "bolder"
}

const whiteStyle = {
    "fontFamily" : "Barlow",
    "fill": "#ffffff",
    "fontSize": 60,
    "fontWeight": "bolder"
}


export class Cell extends Container{

    constructor(value, shapeCreator = ()=>{}, cellSize){
        super();
        this.value = value;

        this._shapeCreator = shapeCreator;

        this._view = this._createVeiw();
        this._view && this.addChild(this._view);

        this._tf = this._createTextField(cellSize);
        this._tf && this.addChild(this._tf);



        this.setValue(value);
    }


    setValue(value){
        this.value = value;
        this._tf.text = value;
        this._setFontStyle();
        this._redraw();
    }

    explode(){
        this.destroy();
    }



    _redraw(){
        const {_view, _shapeCreator, value} = this;
        const color = colors[Math.log2(value) - 1];
        _view.clear();
        _view.beginFill(color);
        _shapeCreator(_view, 0,0);
        _view.endFill();
    }


    _setFontStyle(){
        const {value} = this;
        const style = Math.log2(value) > 2 ? whiteStyle : blackStyle;
        this._tf.style = style;
    }


    _createVeiw(){
        return new Graphics();
    }

    _createTextField(cellSize){
        const tf = new Text('', blackStyle);

        tf.anchor.set(.5);
        tf.position.set(cellSize / 2, cellSize / 2)
        return tf;
    }

}

