'use strict';

export interface IActionWithPayload<T> {
    payload: T;
    type: string;
}
