import {Container, Text, Graphics, ticker} from 'pixi.js';

import Worker from '../serviceWorkers/ticker.worker.js';
import {BankValue} from "./BankValue";

const tickerService = new Worker();

export class Timer extends Container{

    constructor(layout, resources) {
        super();

        this.lastTime = +new Date();
        //seconds
        this.timerValue = 5 * 60;

        this.uuid = null;

        const {x, y}  = layout;


        this.tf = this._createCounterTf(layout.tf);
        this.tf && this.addChild(this.tf);

        this.bankValue = this._createBankValue(layout.tf2, resources);
        this.bankValue && this.addChild(this.bankValue);

        this.bars = this._createBars(layout.progress);
        this.bars.forEach(bar => this.addChild(bar))

        this.x = x;
        this.y = y;

        this.startTime = null;

        this.finishTime = null;

        this.updateTimerValue();

        this._completeCallback = ()=>{}

        this.stopped = false;
    }

    setup(value, elapsedTime = 0){
        this.totalSeconds = value;
        this.elapsedSeconds = elapsedTime;
        const currentTime = value - elapsedTime;
        this.timerValue = currentTime < 0 ? 0 : currentTime;

        this.updateTimerValue();
        this.updateBarsProgress(this.elapsedSeconds * 100 / this.totalSeconds );
    }


    startCountDown(callback = ()=>{}){
        this.stop();

        const time = this.timerValue;
        this.updateTimerValue();

        tickerService.postMessage('start');

        tickerService.onmessage = e =>{
            if (e.data === 'tick'){
                this._onSecondTick();
            }
        }

        this.stopped = false;
        const currentTime = +new Date();
        this.startTime = currentTime - ((this.totalSeconds - this.timerValue) * 1000);
        this.lastTime = currentTime;
        this.finishTime = currentTime + time * 1000;
        this._completeCallback = callback;
        ticker.shared.add(this._onFrameTick, this);
    }

    _onFrameTick(){
        const currentTime = +new Date(),
            totalTime = this.totalSeconds * 1000,
            elapsedTime = currentTime - this.startTime,
            progress = elapsedTime * 100 / totalTime;
        this.updateBarsProgress(progress);
        if (+new Date() >= this.finishTime){
            ticker.shared.remove(this._onFrameTick, this);
        }
    }


    updateBarsProgress(progress){
        this.bars.forEach(bar => bar.setProgress(100 - progress))
    }


    _onSecondTick(){
        this.timerValue--
        this.updateTimerValue();
        if (this.timerValue <= 0) {
            this._completeCallback();
            tickerService.postMessage('stop');
        }
    }


    updateTimerValue(value){
        value = value !== undefined ? value : this.timerValue;
        const minutes = Math.floor(value / 60);
        const seconds = value % 60;
        this.tf.text = `TIME LIMIT: ${minutes > 9 ? minutes : `0${minutes}`}:${seconds > 9 ? seconds:`0${seconds}`}`
    }

    stop(time){
        ticker.shared.remove(this._onFrameTick, this);

        tickerService.postMessage('stop');

        this.updateTimerValue(time);
        if (time !==  undefined){
            this.updateBarsProgress((this.totalSeconds - time) * 100 / this.totalSeconds );
        }
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

    _createBankValue(layout, resources){
        return  new BankValue(layout, resources);
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


    setBankValue(value, currency){
        this.bankValue.setValues(value, currency)
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
