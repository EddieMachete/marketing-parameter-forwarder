'use strict';

import { App } from '@app/index';
import * as web from '@web/index';

console.log(web);
const app = new App();

const webApp = document.querySelector('web-app');
webApp['setApp'](app);
window['app'] = app;
