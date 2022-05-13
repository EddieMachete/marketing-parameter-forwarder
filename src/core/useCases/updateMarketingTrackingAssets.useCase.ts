'use strict';

import { IAppStoreProvider } from '@core/boundaries';

const FORWARD_SEARCH_PARAMS: string = 'forward-search-params';
const TRACKABLE: string = 'trackable';

/**
 * Executes the business logic needed to store any available marketing parameters in
 * a cookie and to append them to the search string of any link requiring it.
 * 
 * @param appStoreProvider Exposes the methods needed to update the application state
 * @param locationHref The page location URL
 * @param referrer URL of the page previously visited
 * @param setCookieDelegate Delegate method that can be called to set a cookie
 * @param cookie
 * @param targetElement Element containing all the anchors to be updated with marketing parameters
 * @param eligibleParameters White list of marketing parameter names needed to prevent script injections
 * @param impressionDelegate Method to be called when an element is awarded an "impression" (is fully visible within the view port).
 * @param clickDelegate Method to be called when the marketing element gets clicked to support custom analytics calls.
 */
export async function updateMarketingTrackingAssetsUseCase(
  appStoreProvider: IAppStoreProvider,
  locationHref: string,
  referrer: string,
  setCookieDelegate: (cookieData: string) => void,
  cookie: string,
  targetElement: HTMLElement,
  eligibleParameters: string[],
  clickDelegate: (ev: MouseEvent) => any,
  impressionDelegate: (target: Element) => any,
): Promise<void> {
  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_checking_if_external_source');
  const url = new URL(locationHref);

  // 1. Check if we are coming from an external source
  const isExternalSource = !referrer || url.hostname !== new URL(referrer).hostname;
  let marketingParameters: { name: string, value: string }[];

  // 1-A If we are coming from an external page,
  if (isExternalSource) {
    await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_updating_cookies');
    marketingParameters = updateMarketingCookies(url, eligibleParameters, setCookieDelegate);
  } else {
    // 1-B If we are coming from an internal page
    //     i. Retrieve the marketing parameters from the existing cookie
    await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_getting_parameters_from_cookies');
    marketingParameters = getMarketingParametersFromCookie(cookie, eligibleParameters);
  }

  // 2. The system updates the marketing assets
  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_updating_marketing_elements');
  updateMarketingElements(targetElement, marketingParameters, impressionDelegate, clickDelegate);

  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_ready');
}

/**
 * Adds the marketing parameters found in a URL to the cookie
 * @param url Contains the marketing parameters
 * @param eligibleParameters White list of marketing parameter names needed to prevent script injections
 * @param setCookieDelegate Delegate method that can be called to set a cookie
 * @returns The marketing parameters found in the url
 */
function updateMarketingCookies(
  url: URL,
  eligibleParameters: string[],
  setCookieDelegate: (cookieData: string) => void,
): { name: string, value: string }[] {
  const marketingParameters: { name: string, value: string }[] = [];

  // 1. Retrieve the white listed parameters from the query string.
  url.searchParams.forEach(
    (value: string, key: string, parent: URLSearchParams) => {
      if (eligibleParameters.indexOf(key) !== -1) {
        // 2. Ensure parameters have been cleaned up to protect against script injections.
        //    We do not propagate parameters with special characters, except - and _,
        //    to prevent Http Parameter Pollution (HPP) attacks
        const cleanValue: string = /[^A-Za-z0-9_\-]/.test(value) ? 'redacted' : value;
        const cookieData = `${key}=${cleanValue}; secure; samesite=lax`;
        // 3. Set marketing cookies
        setCookieDelegate(cookieData);
        // 4. Retrieve the marketing parameters from the URL
        marketingParameters.push({ name: key, value: cleanValue })
      }
    }
  )

  return marketingParameters;
}

/**
 * Adds the marketing parameters stored in a cookie to the appropriate HTML anchors
 * @param marketingParameters Name/value pairs representing the marketing parameters to be added to the marketing links
 * @param targetElement Element containing all the anchors to be updated with marketing parameters
 * @param impressionDelegate Method to be called when an element is awarded an "impression" (is fully visible within the view port).
 * @param clickDelegate Method to be called when the marketing element gets clicked to support custom analytics calls.
 */
function updateMarketingElements(
  targetElement: HTMLElement,
  marketingParameters: { name: string, value: string }[],
  impressionDelegate: (target: Element) => any,
  clickDelegate: (ev: Event) => any,
) {
  let intersectionObserver: IntersectionObserver;
  
  if (window.IntersectionObserver) {
    intersectionObserver = new IntersectionObserver(
      (entries: IntersectionObserverEntry[], observer: IntersectionObserver) => handleImpression(entries, observer, impressionDelegate),
      {
        root: null,
        rootMargin: '0px',
        threshold: 1.0,
      },
    );
  }

  targetElement
    .querySelectorAll(`[${TRACKABLE}], [${FORWARD_SEARCH_PARAMS}]`)
    .forEach(
      (element) => {

        // 2-A) Append marketing search parameters to the search string of marked links
        if (element.hasAttribute(FORWARD_SEARCH_PARAMS) && element instanceof HTMLAnchorElement) {
          appendMarketingAttributesToLink(element as HTMLAnchorElement, marketingParameters);
        }

        // 2-B) Add click and impression events to all marketing elements
        if (element.hasAttribute(TRACKABLE)) {
          if (intersectionObserver) {
            intersectionObserver.observe(element);
          }
          element.addEventListener('click', clickDelegate);
        }
      }
    );
}

/**
 * Retrieves the value string associated to cookie name provided.
 * Returns empty string if no value is found.
 * @param name 
 * @param cookie
 */
function getCookieValue(name: string, cookie: string): string {
  return cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';
}

/**
 * Adds the marketing parameters to the HTML anchor element.
 * If the anchor already has a marketing parameter,
 * this method will overwrite it with the one in the marketing parameters list
 * @param anchor 
 * @param marketingParameters
 */
function appendMarketingAttributesToLink(
  anchor: HTMLAnchorElement,
  marketingParameters: { name: string, value: string }[],
): void {
  if (!anchor) {
    return;
  }

  const url = new URL(anchor.href);

  marketingParameters.forEach(
    parameter => {
      url.searchParams.set(parameter.name, parameter.value);
    }
  );

  // anchor.href = url.href;
  anchor.search = url.search;
}

function getMarketingParametersFromCookie(
  cookie: string,
  eligibleParameters: string[],
): { name: string, value: string }[] {
  const marketingParameters = [];
  eligibleParameters.forEach(
    (parameter: string) => {
      const cookieValue: string = getCookieValue(parameter, cookie);

      if (cookieValue) {
        marketingParameters.push({ name: parameter, value: cookieValue });
      }
    },
  );

  return marketingParameters;
}

function handleImpression(
  entries: IntersectionObserverEntry[],
  observer: IntersectionObserver,
  impressionDelegate: (target: Element) => any,
) {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      observer.unobserve(entry.target);
      impressionDelegate(entry.target);
    }
  });
}
