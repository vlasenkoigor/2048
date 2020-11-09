import {ErrorPopup} from './ErrorPopup';

export class NetworkErrorPopup extends ErrorPopup{

    build(layout) {
        const {
            x, y,
            width,
            height,
            radius,
            alpha,
            text,
        } = layout;

        this.x = x;
        this.y = y;

        this._createBackground(width, height, radius, alpha);

        this.valueTf = this._createText(
            "",
            {
                fontFamily : 'Fira Sans',
                fontSize : text.fontSize || 14,
                fontWeight : 'bold',
                align : 'center',
                fill : "#F76148",
                wordWrap : true, wordWrapWidth : width * 0.9
            },
            text
        )

    }
}
