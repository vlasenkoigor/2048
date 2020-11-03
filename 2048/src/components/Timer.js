import {Container, Text, Graphics, ticker} from 'pixi.js';

import Worker from '../serviceWorkers/ticker.worker.js';

const tickerService = new Worker();

export class Timer extends Container{

    constructor(layout) {
        super();

        this.lastTime = +new Date();
        //seconds
        this.timerValue = 5 * 60;

        this.uuid = null;

        const {x, y}  = layout;


        this.tf = this._createCounterTf(layout.tf);
        this.tf && this.addChild(this.tf);

        this.tf2 = this._createBankTf(layout.tf2);
        this.tf2 && this.addChild(this.tf2);



        this.bars = this._createBars(layout.progress);
        this.bars.forEach(bar => this.addChild(bar))

        this.x = x;
        this.y = y;

        this.startTime = null;

        this.finishTime = null;

        this.setTimerValue();

        this._completeCallback = ()=>{}

        this.stopped = false;
    }

    setup(value, elapsedTime = 0){
        this.totalSeconts = value;
        this.elapsedSeconds = elapsedTime;
        const currentTime = value - elapsedTime;
        this.timerValue = currentTime < 0 ? 0 : currentTime;

        this.setTimerValue();
    }

    setTimerValue(value){
        value = value !== undefined ? value : this.timerValue;
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        this.tf.text = `TIME LIMIT: ${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds:`0${seconds}`}`
    }

    _createCounterTf(layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Fira Sans',
            fontSize : 24,
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

    _createBankTf(layout){
        const {x, y} = layout;
        const style = {
            fontFamily : 'Fira Sans',
            fontSize : 24,
            fontWeight : 500,
            fill : "#00C443"
        }
        const tf = new Text(`BANK: `, style);

        tf.x = x;
        tf.y = y;

        if (layout.anchor){
            tf.anchor.set(layout.anchor.x, layout.anchor.y);
        }

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


    startCountDown(callback = ()=>{}){
        this.stop();

        const time = this.timerValue;
        this.setTimerValue();

        tickerService.postMessage('start');

        tickerService.onmessage = e =>{
            if (e.data === 'tick'){
                this._onSecondTick();
            }
        }

        this.stopped = false;
        const currentTime = +new Date();
        this.startTime = currentTime - (this.elapsedSeconds * 1000);
        this.lastTime = currentTime;
        this.finishTime = currentTime + time * 1000;
        this._completeCallback = callback;
        ticker.shared.add(this._onTick, this);
    }

    _onTick(){
        const currentTime = +new Date(),
            totalTime = this.totalSeconts * 1000,
            progressTime = currentTime - this.startTime,
            progress = progressTime * 100 / totalTime;

        if (currentTime >= this.finishTime){
            ticker.shared.remove(this._onTick, this);
        }
        this.bars.forEach(bar => bar.setProgress(100 - progress))
    }



    _onSecondTick(){
        this.timerValue--
        this.setTimerValue();
        if (this.timerValue <= 0) {
            this._completeCallback();
            tickerService.postMessage('stop');
        }
    }

    stop(time){
        if (this.stopped) return;
        this.stopped = false;

        ticker.shared.remove(this._onTick, this);
        this._onTick();
        tickerService.postMessage('stop');

        if (time !== undefined){
            this.setTimerValue(time);
        }
    }




    setBankValue(value){
        this.tf2.text = `BANK: ${value}`
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
