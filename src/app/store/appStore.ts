'use strict';

import { IAppState } from "@core/boundaries";
import { IDataStore } from "./";
import * as Reducers from './reducers';

export const appStore: IDataStore<IAppState> = {
  state: {
    cookieData: [],
    welcomeMessage: 'Welcome to the basic project sandbox!',
  },
  subscribe: function (handler) {
    if (!this.handlers) {
      this.handlers = [];
    }

    this.handlers.push(handler);

    return () => {
      this.handlers = this.handlers.filter((value: Function) => value != handler);
    };
  },
  getState: function () {
    return this.state;
  },
  dispatch: function (action) {
    Reducers.default.forEach((reducer: Function) => {
      this.state = reducer(this.state, action);
    });

    if (!this.handlers) {
      return;
    }

    this.handlers.forEach((handler: Function) => handler(this.state, action.type));
  }
};
