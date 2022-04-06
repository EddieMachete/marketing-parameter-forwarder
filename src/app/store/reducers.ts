'use strict';

import { IAppState } from '@core/boundaries';
import { IActionWithPayload } from './iActionWithPayload';

const marketingAssetsStatusReducer = (state: IAppState = null, action: IActionWithPayload<string>): IAppState => {
  if (action.type === 'update_marketing_assets_status') {
    return Object.assign(
      {},
      state,
      { marketingAssetsStatus: action.payload },
    );
  }

  return state;
};

export {
  marketingAssetsStatusReducer,
};

export default [
  marketingAssetsStatusReducer,
];
