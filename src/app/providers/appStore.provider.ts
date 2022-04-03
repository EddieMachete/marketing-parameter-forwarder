'use strict';

import { IDataStore } from "@app/store";
import { IAppState, IAppStoreProvider } from "@core/boundaries";

export class AppStoreProvider implements IAppStoreProvider {
  public constructor(private appStore: IDataStore<IAppState>) { }

  setMarketingCookieData(cookieData: string[]): Promise<void> {
    this.appStore.dispatch(
      {
        type: 'set_marketing_cookie',
        payload: cookieData,
      },
    );

    return Promise.resolve();
  }
}
