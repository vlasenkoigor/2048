import { Container, Graphics, Text, utils, ViewableBuffer } from "pixi.js";


const colors = [
    '#eee4da',
    '#eee1ce',
    '#f4b27e',
    '#f3976b',
    '#f07f68',
    '#ee6047',
    '#efcd72',
    '#edca64',
    '#edc651',
    '#eec745',
    '#ecc344'
];

const blackStyle = {
    "fill": "#6e6e6e",
    "fontSize": 60,
    "fontWeight": "bolder"
}

const whiteStyle = {
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
        
        // if (value === 16){
        //     debugger
        //     console.log('redraw', color);
        // }
        _view.clear();
        _view.beginFill(utils.string2hex(color));
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

