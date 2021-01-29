import {Container, Graphics, Text} from 'pixi.js';


export class ErrorPopup extends Container{

    constructor(layout) {
        super();

        this.build(layout);
        this.hide();
    }

    build(layout){

        const {
            x, y,
            width,
            height,
            radius,
            alpha,
            text1,
            text2,
        } = layout;

        this.x = x;
        this.y = y;

        this._createBackground(width, height, radius, alpha);
        this._createText(
            'Game Error',
            {
                fontFamily : 'Fira Sans',
                fontSize : text1.fontSize || 14,
                fontWeight : 'normal',
                fill : "#CB0000"
            },
            text1
        );

        this.valueTf = this._createText(
            'Session conflict!\nMost likely the game has been opened on 2 or more tabs or devices for current player.\nClose the game on all devices and try again',
            {
                fontFamily : 'Fira Sans',
                fontSize : text2.fontSize || 14,
                fontWeight : 'bold',
                align : 'center',
                fill : "#3D3A33",
                wordWrap : true, wordWrapWidth : width * 0.9
            },
            text2
        )

    }



    _createBackground(width, height, radius, alpha){
        const g = new Graphics();
        g.beginFill(0xFFFFFF, alpha || 0.8);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        g.cacheAsBitmap = true;
        this.addChild(g);
    }

    _createText(text, style, layout){
        const tf = new Text(text, style);
        if (layout){
            const {x, y, anchor} = layout
            tf.x = x;
            tf.y = y;
            if (anchor){
                tf.anchor.set(anchor.x, anchor.y)
            }
        }

        this.addChild(tf);
        return tf;
    }


    show(errorCode = 1, message){
        this.visible = true;
        this.valueTf.text = this.getText(errorCode, message);
    }

    hide(){
        this.visible = false;
    }

    getText(code, message){
        switch (code) {

            case 1:
                return 'Session conflict!\nMost likely the game has been opened on 2 or more tabs or devices for current player.\nClose the game on all devices and try again';

            default:
                return message;
        }
    }

}
