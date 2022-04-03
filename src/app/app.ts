'use strict';

import { IAppState, IAppStoreProvider } from "@core/boundaries";
import { setMarketingCookieUseCase, updateCtasWithMarketingParametersUseCase } from "@core/useCases";
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

        setMarketingCookieUseCase(
          this.appStoreProvider,
          document.location,
          document.referrer,
          this.eligibleParameters,
        )
    }

    public disconnect(): void {
        this.unsubscribeFromStoreHandler();
    }

    public getAppStore(): IDataStore<IAppState> {
        return appStore;
    }

    private stateChanged(state: IAppState, actionType: string): void {
      if (actionType === 'set_marketing_cookie') {
        state.cookieData.forEach((data:string) => document.cookie = data);
        updateCtasWithMarketingParametersUseCase(
          document.cookie,
          document.body,
          'data-forward-utms',
          this.eligibleParameters,
        );
      }
    }
}
