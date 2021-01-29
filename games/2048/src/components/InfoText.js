import {Text} from 'pixi.js';

export class InfoText extends Text {
    constructor(layout) {
        super('По окончанию игры, в личном кабинете MindPlays, будут доступны все логи действий противника а так же видеозапись экрана',
        {
            fontFamily : 'Fira Sans',
            fontSize : 14,
            fontWeight : 'normal',
            fill : "#BBAE9E"
        });

        const {
            x, y, anchor
        } = layout;

        this.x = x;
        this.y = y;

        this.anchor.set(anchor.x, anchor.y);

    }
}
