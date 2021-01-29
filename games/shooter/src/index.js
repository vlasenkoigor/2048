import * as PIXI from 'pixi.js'
window.PIXI = PIXI;
import config from './config';

import {Application} from '../../common/Application';

const app = new Application(config);
console.log(app);
