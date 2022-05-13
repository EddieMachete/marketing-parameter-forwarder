'use strict';

export class MarketingElement extends HTMLElement {
  private intersectionObserver: IntersectionObserver;

  public static get is(): string {
    return 'marketing-element';
  }

  public static get marketingAttributes(): string[] {
    return [
      'itcat',
      'itterm',
      'utm-campaign',
      'utm-content',
      'utm-medium',
      'utm-source',
      'utm-term',
    ];
  }

  public static get observedAttributes(): string[] {
    return [...MarketingElement.marketingAttributes];
  }

  public constructor() {
    super();
  }

  public connectedCallback() {
    this.addEventListener('click', this.handleClick);

    this.intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[]) => this.handleImpression(entries),
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );
    
    this.intersectionObserver.observe(this);
  }

  public disconnectedCallback() {
    this.removeEventListener('click', this.handleClick);
    this.intersectionObserver.unobserve(this);
  }

  public handleClick(e: MouseEvent) {
    if (!this.hasAttribute('capture-clicks')) {
      return;
    }
    
    alert(`Logging click event [${this.getAttribute('name')}]`);
  }

  public handleImpression(entries: IntersectionObserverEntry[]) {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const schema = this.getAttribute('data-impression-schema');
        console.log(`Logging impression event [${this.getAttribute('name')}]`);
        this.intersectionObserver.unobserve(this);
      }
    });
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

    if (MarketingElement.marketingAttributes.includes(name)) {
      this.updateSearchParameter(name, newValue);
    }
  }

  private updateSearchParameter(key: string, value?: string): void {
    this
      .querySelectorAll('a[data-search-parameters]')
      .forEach((a: HTMLAnchorElement) => this.updateAnchor(a, key, value));
  }

  private updateAnchor(anchor: HTMLAnchorElement, key, value): void {
    const url = new URL(anchor.href);
    const anchorParameters = anchor.getAttribute('data-search-parameters').replace(/\s/g, '').split(',');
    const addAll = anchorParameters.length === 0;

    if (addAll || anchorParameters.includes(key)) {
      if (value) {
        url.searchParams.set(key, value.toString());
      } else {
        url.searchParams.delete(key);
      }
    }

    anchor.search = url.search;
  }
}

window.customElements.define(MarketingElement.is, MarketingElement);
