'use strict';

import { IActionWithPayload } from './';

export interface IDataStore<T> {
    state: T;
    subscribe(handler: Function): Function;
    getState(): T;
    dispatch(action: IActionWithPayload<any>): void;
}
