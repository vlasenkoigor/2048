import {Container, Text, Sprite}  from 'pixi.js';

export class BankValue extends Container {

    constructor(layout, resources) {
        super(layout);

        const {x, y} = layout;

        this.currenciesTextures = [
            resources.coin_1.texture,
            resources.coin_2.texture,
        ]

        this.title = this._createTitleTf();

        this.value = this._createValueTf();

        this.currencyIcon = this._createCurrencyIcon();

        this.x = x;
        this.y = y;
    }

    setValues(value, currency = 0){
        this.value.text = value;
        this.value.visible = true;
        if (currency){
            const mapping = {
                1 : COLORS.GREEN,
                2 : COLORS.GREY
            }

            this.value.style.fill = mapping[currency]
            currency = parseInt(currency);
            this.currencyIcon.visible = true;
            this.currencyIcon.texture = this.currenciesTextures[currency-1];
        }

        //update locations
        this.value.x = this.title.x;

        if (currency){
            this.currencyIcon.x = this.value.x + this.value.width + 5;
        }
    }

    _createTitleTf(){
        const tf = new Text("BANK: ", STYLES.GREEN);
        this.addChild(tf);
        tf.anchor.set(1, 0)
        return tf;
    }

    _createValueTf(){
        const tf = new Text("", STYLES.GREEN);
        this.addChild(tf);
        tf.anchor.set(0, 0);
        tf.visible = false;
        return tf;
    }

    _createCurrencyIcon(){
        const icon = new Sprite(this.currenciesTextures[0])
        this.addChild(icon);
        icon.anchor.set(0, 0);
        icon.width = 22;
        icon.height = 22;
        icon.y = 2;
        icon.visible = false;
        return icon;
    }



}


const COLORS = {
    GREEN : "#00C443",
    GREY : "#6886AF"
}
const BASIC_STYLE =  {
    fontFamily : 'Fira Sans',
    fontSize : 24,
    fontWeight : 500,

}


const STYLES = {
    GREEN:  Object.assign({}, BASIC_STYLE, { fill : COLORS.GREEN}),
    GREY:  Object.assign({}, BASIC_STYLE, { fill : COLORS.GREY})
}
