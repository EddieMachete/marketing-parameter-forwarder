'use strict';

import { IAppStoreProvider } from '@core/boundaries';

/*
 * 1. Check if we are coming from an external source
 *   A) If we are coming from an external page, update marketing cookies
 *      - 1 Retrieve the white listed parameters from the query string.
 *      - 2 Ensure parameters have been cleaned up to protect against script injections.
 *      - 3 Set marketing cookies
 * 2. If we are coming from an internal page, update marketing links
 *   - 1. Retrieve marketing parameters from cookie
 *   - 2. Update eligible links
 */
export async function updateMarketingTrackingAssetsUseCase(
  appStoreProvider: IAppStoreProvider,
  location: Location,
  referrer: string,
  setCookieDelegate: (cookieData: string) => void,
  cookie: string,
  targetElement: HTMLElement,
  dataAttribute: string,
  eligibleParameters: string[],
): Promise<void> {
  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_checking_if_external_source');
  const url = new URL(location.href);

  // 1. Check if we are coming from an external source
  const isExternalSource = !referrer || url.hostname !== new URL(referrer).hostname;

  // A) If we are coming from an external page,
  if (isExternalSource) {
    await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_updating_cookies');
    updateMarketingCookies(url, eligibleParameters, setCookieDelegate);
  }
  
  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_updating_links');
  
  updateMarketingLinks(
    eligibleParameters,
    cookie,
    targetElement,
    dataAttribute,
  );

  await appStoreProvider.updateMarketingAssetsStatus('marketing_assets_status_ready');
}

function updateMarketingCookies(
  url: URL,
  eligibleParameters: string[],
  setCookieDelegate: (cookieData: string) => void,
) {
  // 1. Retrieve the white listed parameters from the query string.
  url.searchParams.forEach(
    (value: string, key: string, parent: URLSearchParams) => {
      if (eligibleParameters.indexOf(key) !== -1) {
        // 2. Ensure parameters have been cleaned up to protect against script injections.
        //    We do not propagate parameters with special characters, except - and _,
        //    to prevent Http Parameter Pollution (HPP) attacks
        const cookieData = `${key}=${/[^A-Za-z0-9_\-]/.test(value) ? 'redacted' : value}; secure; samesite=lax`;
        // 3. Set marketing cookies
        setCookieDelegate(cookieData);
      }
    }
  )
}

function updateMarketingLinks(
  eligibleParameters: string[],
  cookie: string,
  targetElement: HTMLElement,
  dataAttribute: string,
) {
  // 1. Retrieve marketing parameters from cookie
  const marketingParameters = [];
  eligibleParameters.forEach((parameter: string) => {
    const cookieValue: string = getCookieValue(parameter, cookie);

    if (cookieValue) {
      marketingParameters.push({ name: parameter, value: cookieValue });
    }
  },
  );

  // 2. Update eligible links
  targetElement
    .querySelectorAll(`a[${dataAttribute}]`)
    .forEach((anchor) => appendMarketingAttributesToLink(anchor as HTMLAnchorElement, marketingParameters));
}

function getCookieValue(name: string, cookie: string) {
  return cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';
}

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
      if (!url.searchParams.has(parameter.name)) {
        url.searchParams.set(parameter.name, parameter.value);
      }
    }
  );

  anchor.href = url.href;
}