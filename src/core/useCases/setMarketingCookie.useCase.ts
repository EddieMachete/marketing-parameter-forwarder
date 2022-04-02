'use strict';

import { IAppStoreProvider } from "@core/boundaries";

/*
 * Check if we are coming from an external source
 *   If we are coming from an internal page, finish.
 * Retrieve the white listed parameters from the query string.
 *   Ensure parameters have been cleaned up to protect against script injections.
 * Create and set cookie
 */
export function setMarketingCookieUseCase(
  appStoreProvider: IAppStoreProvider,
  location: Location,
  referrer: string,
  eligibleParameters: string[],
  ): void {
  const url = new URL(location.href);

  if (referrer && url.hostname === new URL(referrer).hostname) {
    return;
  }

  appStoreProvider.setMarketingCookieData(
    getMarketingCookieData(url, eligibleParameters),
  );
}

function getMarketingCookieData(url: URL, eligibleParameters: string[]): string {
  let cookieData = '';

  url.searchParams.forEach(
    (value: string, key: string, parent: URLSearchParams) => {
      if (eligibleParameters.indexOf(key) !== -1) {
        // We do not propagate parameters with special characters, except - and _, to prevent Http Parameter Pollution (HPP) attacks
        cookieData += `${key}=${/[^A-Za-z0-9_\-]/.test(value) ? 'redacted' : value}; `;
      }
    }
  )

  return cookieData += 'secure; samesite=lax';
}
