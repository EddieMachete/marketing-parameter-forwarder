'use strict';

import { IAppStoreProvider } from '@core/boundaries';
import {updateMarketingTrackingAssetsUseCase} from './updateMarketingTrackingAssets.useCase';

/// <reference types="jest" />
/**
 * @jest-environment jsdom
 */

/*
 User story:
 As a marketing specialist, when deploying a campaign,
 I want our public website to forward our UTM and other marketing parameters when exiting the site
 so that we can piece together the visitor's journey and track the success of our campaigns.
 
 Business logic:
 1. When a page on the site loads, the system checks if we are coming from an external source
    A) If we are coming from an external page, the system updates the marketing cookies
       1. The system retrieves the white listed parameters from the query string
       2. The system ensures parameters have been cleaned up to protect against script injections
       3. The system sets the marketing cookies
       4. The system retrieves the marketing parameters from the URL
    B) If we are coming from an internal page
       1. The system retrieves the marketing parameters from the existing cookie
 2. The system updates the marketing links on the page by appending the marketing parameters to the search string
 */

describe('Use case: Update marketing tracking assets', () => {

  test('The right marketing parameters are stored in a cookie and appended to the anchors when coming from an external site', (done) => {

    document.body.innerHTML = `
    <h1>Marketing Parameter Forwarder</h1>
    <ul>
      <li>
        <a href="index.html">Home</a>
        <a href="page_1.html">Internal page</a>
        <a id="externalAnchor" href="https://www.externalsite.com/" data-forward-utms>External page</a>
      </li>
    </ul>
    `;

    const internalDomain = 'https://localhost:44333/';
    const externalDomain = 'https://www.externalsite.com/';
    const expectedStatusMessages = [
      'marketing_assets_status_checking_if_external_source',
      'marketing_assets_status_updating_cookies',
      'marketing_assets_status_updating_links',
      'marketing_assets_status_ready',
    ];

    const expectedCookies = [
      'utm_source=google; secure; samesite=lax',
      'utm_medium=cpc; secure; samesite=lax',
      'utm_campaign=spring_sale; secure; samesite=lax',
      'utm_term=running_shoes; secure; samesite=lax',
      'utm_content=textlink; secure; samesite=lax',
    ];

    const cookies: string[] = [];
    const marketingAssetsStatus: string[] = [];
    
    const locationHref =
      `${internalDomain}?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=running_shoes&utm_content=textlink`;

    const setCookieDelegate = (cookieData: string) => {
      document.cookie = cookieData;
      cookies.push(cookieData);
    };

    const appStoreProvider: IAppStoreProvider = {
      updateMarketingAssetsStatus: jest.fn(
        (status: string) => {
          marketingAssetsStatus.push(status);

          if (marketingAssetsStatus.length === expectedStatusMessages.length) {
            runAssertions();
          }
          return Promise.resolve();
        }
      ),
    };

    updateMarketingTrackingAssetsUseCase(
      appStoreProvider,
      locationHref,
      externalDomain,
      setCookieDelegate,
      '',
      document.body,
      'data-forward-utms',
      [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
      ],
    );

    function runAssertions() {
      const externalAnchor = document.body.querySelector('#externalAnchor') as HTMLAnchorElement;

      expect(marketingAssetsStatus.join(',')).toBe(expectedStatusMessages.join(','));
      expect(cookies).toEqual(expectedCookies);
      expect(externalAnchor.href).toBe(`${externalDomain}?utm_source=google&utm_medium=cpc&utm_campaign=spring_sale&utm_term=running_shoes&utm_content=textlink`);
      done();
    }
  });
});
