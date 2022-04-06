'use strict';

export interface IAppStoreProvider {
  updateMarketingAssetsStatus(status: string): Promise<void>;
}