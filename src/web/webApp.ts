'use strict';

import { App } from "@app/app";
import { IDataStore } from "@app/store";
import { IAppState } from "@core/boundaries";

export class WebApp extends HTMLElement {
    public static get is(): string {
        return 'web-app';
    }

    private template: string = `
        <style>
            :host {
                display: block;
            }
        </style>
        <sample-web-component bind-to="status"></sample-web-component>
    `;

    private app: App;
    private unsubscribeFromStoreHandler: Function;

    public constructor() {
        super();

        const shadowRoot: ShadowRoot = this.attachShadow({mode: 'open'});
        shadowRoot.innerHTML = this.template;
    }

    public disconnectedCallback(): void {
        // When the element is removed from the DOM, unsubscribe from the application store
        this.unsubscribeFromStoreHandler();
    }

    public setApp(app: App): void {
        this.app = app;
        const appStore: IDataStore<IAppState> = this.app.getAppStore();
        this.unsubscribeFromStoreHandler = appStore.subscribe(
            (state: IAppState, actionType: string) => this.stateChanged(state, actionType)
        );

        this.stateChanged(appStore.state, '');
    }

    private stateChanged(state: IAppState, actionType: string): void {
        const statusElement: HTMLElement = this.shadowRoot.querySelector('[bind-to=status]');

        if (statusElement) {
            statusElement.setAttribute('message', state.welcomeMessage);
        }
    }
}

window.customElements.define(WebApp.is, WebApp);