'use strict';

import { IAppState } from '@core/boundaries';
import { IActionWithPayload } from './iActionWithPayload';

const reducer = (state: IAppState = null, action: IActionWithPayload<string>): IAppState => {
  if (action.type === 'set_marketing_cookie') {
    return Object.assign(
      {},
      state,
      { cookieData: action.payload },
    );
  }

  return state;
};

export {
  reducer,
};

export default [
  reducer,
];
