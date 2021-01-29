import {Container, Graphics, Text} from 'pixi.js';


export class GameOverPopup extends Container{

    constructor(layout, isOpponentPopup) {
        super();

        const {
            x, y,
            width,
            height,
            radius,
            alpha,
            text1,
            text2,
            text3
        } = layout;

        this.x = x;
        this.y = y;


        this._createBackground(width, height, radius, alpha);
        this._createText(
            !isOpponentPopup? 'Вы завершили игру с результатом' : 'Противник завершил игру с результатом',
            {
                fontFamily : 'Fira Sans',
                fontSize : text1.fontSize || 14,
                fontWeight : 'normal',
                fill : "#3D3A33"
            },
            text1
        );

        this.valueTf = this._createText(
            '12312',
            {
                fontFamily : 'Fira Sans',
                fontSize : text2.fontSize || 14,
                fontWeight : 'bold',
                fill : "#3D3A33"
            },
            text2
        )

        if (text3){
            this.waitingTf = this._createText(
                'Ожидаем результат противника...',
                {
                    fontFamily : 'Fira Sans',
                    fontSize : text3.fontSize || 14,
                    fontWeight : 'normal',
                    fill : "#CB0000"
                },
                text3
            );
        }

        this.hide();
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


    show(result, isWaitingVisible = false){
        this.visible = true;
        this.valueTf.text = result;
        this.waitingVisibility(isWaitingVisible);
    }

    hide(){
        this.visible = false;
        this.waitingVisibility(false);
    }

    waitingVisibility(isVisible){
        if (!this.waitingTf) return;

        this.waitingTf.visible = isVisible;
    }



}
