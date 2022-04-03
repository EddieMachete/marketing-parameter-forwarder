'use strict';

export interface IAppStoreProvider {
  setMarketingCookieData(data: string[]): Promise<void>;
}