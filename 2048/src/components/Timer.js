import {Container, Text, Graphics, ticker} from 'pixi.js';

export class Timer extends Container{

    constructor(layout) {
        super();

        this.lastTime = +new Date();
        //seconds
        this.timerValue = 5 * 60;

        this.uuid = null;

        const {x, y, hasTitle} = layout;

        if (hasTitle){
            const title = this._createTitleTf(layout.title);
            title && this.addChild(title);
        }

        this.tf = this._createCounterTf(layout.tf);
        this.tf && this.addChild(this.tf);

        this.bars = this._createBars(layout.progress);
        this.bars.forEach(bar => this.addChild(bar))

        this.x = x;
        this.y = y;

        this.startTime = null;

        this.finishTime = null;

        this.setTimerValue(this.timerValue);

        this._completeCallback = ()=>{}

    }

    setTimerValue(value){
        this.timerValue = value < 0 ? 0 : value;
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;

        this.tf.text = `${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds:`0${seconds}`}`
    }

    _createCounterTf(layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Barlow',
            fontSize : 36,
            fontWeight : 500,
            fill : "#3D3A33"
        }
        const tf = new Text(``, style);

        tf.x = x;
        tf.y = y;

        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y);
        }

        return tf;
    }



    _createTitleTf(layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Barlow',
            fontSize : 14,
            fill : "#114D51"
        }
        const tf = new Text("TIME LIMIT", style);

        tf.x = x;
        tf.y = y;

        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y);
        }

        // tf.cacheAsBitmap = false;
        return tf;
    }

    _createBars(layout){
        const {gap, width, height} = layout;
        const progress1 = new ProgressBar(layout, 2);
        const progress2 = new ProgressBar(layout, 1);

        //left
        progress1.x = layout.x - (gap/2);
        progress1.y = layout.y;

        //right
        progress2.x = layout.x + (gap / 2);
        progress2.y = layout.y;

        progress1.pivot.set(width, height / 2);
        progress2.pivot.set(0, height / 2);

        return [
            progress1,
            progress2
        ]

    }


    startCountDown(time, callback = ()=>{}){
        if (!time) time = this.timerValue;
        this.setTimerValue(time);
        this.uuid = setInterval(this._onSecondTick.bind(this), 1000);
        this.startTime = +new Date();
        this.lastTime = +new Date();
        this.finishTime = this.startTime + time * 1000;
        this._completeCallback = callback;
        ticker.shared.add(this._onTick, this);
    }

    stop(){
        ticker.shared.remove(this._onTick, this);
        clearInterval(this.uuid)
    }

    _onSecondTick(){
        const t = +new Date();
        console.log('tick', this.timerValue, t - this.lastTime);
        this.lastTime = t;
        this.timerValue--
        this.setTimerValue(this.timerValue);
        if (this.timerValue <= 0) {
            this._completeCallback();
            clearInterval(this.uuid)
        }
    }

    _onTick(){
        const currentTime = +new Date(),
            totalTime = this.finishTime - this.startTime,
            progressTime = currentTime - this.startTime,
            progress = progressTime * 100 / totalTime;

        if (currentTime >= this.finishTime){
            ticker.shared.remove(this._onTick, this);
        }
        this.bars.forEach(bar => bar.setProgress(100 - progress))
    }


}


class ProgressBar extends Container{

    constructor(config = {}, direction = 1) {
        super();


        this._config = config;
        const {
            width,
            height,
            radius
        } = config

        // 1 - left to right
        // 2 - right to left
        this.direction = direction || 1;

        const bg = this._createBackground(width, height, radius);
        bg && this.addChild(bg);

        const view = this._createProgressView(width, height, radius);
        view && this.addChild(view);

        const mask = this._createMask(width, height, radius);
        this.addChild(mask);
        view.mask = mask;
        this.view = view;

        this.progress = 100;
        this.setProgress(this.progress);
    }

    _createBackground(width, height, radius){
        const g = new Graphics();
        g.beginFill(0xD9D9D9);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        return g;
    }


    _createProgressView(width, height, radius){
        const g = new Graphics();
        g.beginFill(0xF76148);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        return g;
    }

    _createMask(width, height, radius){
        const g = new Graphics();
        g.beginFill(0xD9D9D9);
        g.drawRoundedRect(0,0,width, height, radius);
        g.endFill();
        return g;
    }

    setProgress(progress){
        if (progress < 0) progress = 0;
        if (progress > 100) progress = 100;
        this.progress = progress;
        this.view.width = this._config.width * this.progress / 100;
        if (this.direction === 2){
            this.view.x = this._config.width - this.view.width;
        }
    }

}
