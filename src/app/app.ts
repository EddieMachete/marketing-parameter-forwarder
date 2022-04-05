'use strict';

import { IAppState, IAppStoreProvider } from "@core/boundaries";
import { updateMarketingTrackingAssetsUseCase } from "@core/useCases";
import { AppStoreProvider } from "./providers/appStore.provider";
import { appStore, IDataStore } from "./store";

export class App {
  private unsubscribeFromStoreHandler: Function;
  private appStoreProvider: IAppStoreProvider = new AppStoreProvider(appStore);
  private eligibleParameters = [
    'utm_source',
    'utm_medium',
    'utm_campaign',
    'utm_term',
    'utm_content',
  ];

  public constructor() {
    this.unsubscribeFromStoreHandler =
      appStore.subscribe(
        (state: IAppState, actionType: string) => this.stateChanged(state, actionType)
      );

    console.log(appStore.getState().welcomeMessage);

    updateMarketingTrackingAssetsUseCase(
      this.appStoreProvider,
      document.location,
      document.referrer,
      (cookieData: string) => document.cookie = cookieData,
      document.cookie,
      document.body,
      'data-forward-utms',
      this.eligibleParameters,
    );
  }

  public disconnect(): void {
    this.unsubscribeFromStoreHandler();
  }

  public getAppStore(): IDataStore<IAppState> {
    return appStore;
  }

  private stateChanged(state: IAppState, actionType: string): void {
    if (actionType === 'update_marketing_assets_status') {
      console.log(state.marketingAssetsStatus);
    }
  }
}
