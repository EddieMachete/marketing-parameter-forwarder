'use strict';

import { IDataStore } from "@app/store";
import { IAppState, IAppStoreProvider } from "@core/boundaries";

export class AppStoreProvider implements IAppStoreProvider {
  public constructor(private appStore: IDataStore<IAppState>) { }

  public updateMarketingAssetsStatus(status: string): Promise<void> {
    this.appStore.dispatch(
      {
        type: 'update_marketing_assets_status',
        payload: status,
      }
    );

    return Promise.resolve();
  }
}
