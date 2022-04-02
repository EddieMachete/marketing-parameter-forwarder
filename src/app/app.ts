'use strict';

import { IAppState, IAppStoreProvider } from "@core/boundaries";
import { setMarketingCookieUseCase } from "@core/useCases";
import { AppStoreProvider } from "./providers/appStore.provider";
import { appStore, IDataStore } from "./store";

export class App {
    private unsubscribeFromStoreHandler: Function;
    private appStoreProvider: IAppStoreProvider = new AppStoreProvider(appStore);

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
          [
            'utm_source',
            'utm_medium',
            'utm_campaign',
            'utm_term',
            'utm_content',
          ],
        )
    }

    public disconnect(): void {
        this.unsubscribeFromStoreHandler();
    }

    public getAppStore(): IDataStore<IAppState> {
        return appStore;
    }

    private stateChanged(state: IAppState, actionType: string): void {
      console.log(state);
      
      if (actionType === 'set_marketing_cookie') {
        document.cookie = state.cookieData;
      }
    }
}
