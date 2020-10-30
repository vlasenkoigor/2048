import {Container, Text, Graphics} from 'pixi.js'


export class Online extends Container{
    constructor(layout, isMobile) {
        super();

        const {x, y} = layout;

        const text = this.createText(layout);

        if (!isMobile){
            const pin = this.createPin();

            pin.x = text.width;
        }



        this.x = x;
        this.y = y;

    }


    createText(layout){
        const text = new Text('Online streaming',  {
            fontFamily : 'Fira Sans',
            fontSize : layout.fontSize || 14,
            fontWeight : 'normal',
            fill : "#00C443"
        });
        text.anchor.set(0,0.5);

        this.addChild(text);

        return text;
    }


    createPin(){
        const pin = new Graphics();
        pin.beginFill(0x00C443);
        pin.drawCircle(20,1,4);
        pin.endFill();

        this.addChild(pin);
        return pin;
    }


}
