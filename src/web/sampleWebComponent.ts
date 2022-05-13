'use strict';

export class SampleWebComponent extends HTMLElement {
  public static get is(): string {
    return 'sample-web-component';
  }

  public static get observedAttributes(): string[] {
    return ['message'];
  }

  private template: string = `
        <style>
            :host {
                display: block;
            }
        </style>
        <h3 bind-to="message">...</h3>
    `;

  private messageElement: HTMLElement;

  public constructor() {
    super();

    const shadowRoot: ShadowRoot = this.attachShadow({ mode: 'open' });
    shadowRoot.innerHTML = this.template;
    this.messageElement = shadowRoot.querySelector('[bind-to=message]');
  }

  public attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string,
    namespace: string,
  ): void {
    if (oldValue === newValue) {
      return;
    }

    if (name === 'message') {
      this.messageElement.textContent = newValue;
      return;
    }
  }
}

window.customElements.define(SampleWebComponent.is, SampleWebComponent);
