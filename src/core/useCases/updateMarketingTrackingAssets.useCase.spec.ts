'use strict';

import { IAppStoreProvider } from '@core/boundaries';
import {updateMarketingTrackingAssetsUseCase} from './updateMarketingTrackingAssets.useCase';

/// <reference types="jest" />
/**
 * @jest-environment jsdom
 */

/*
 User story 1:
 As a marketing specialist,
 when deploying a campaign,
 I want our public website to forward the UTM and other marketing parameters when navigating to admin
 so that we can piece together the visitor's journey and track the success of our campaigns.
 
 User story 2:
 As a marketing specialist,
 when analyzing the visitor journeys,
 I want to have access to impression and click data
 so I can determine what elements of a page need to receive attribution weight.

 Business logic:
 1. When a page on the site loads, the system checks if we are coming from an external source
    A) If we are coming from an external page, the system updates the marketing cookies
       i. The system retrieves the white listed parameters from the query string
       ii. The system ensures parameters have been cleaned up to protect against script injections
       iii. The system sets the marketing cookies
       iv. The system retrieves the marketing parameters from the URL
    B) If we are coming from an internal page
       i. The system retrieves the marketing parameters from the existing cookie
 2. The system updates the marketing assets by
    A) Appending the marketing search parameters to the search string of marked links
    B) Adding click and impression events to all marketing elements
 */
describe('Use case: Update marketing tracking assets', () => {

  test('The right marketing parameters are stored in a cookie and appended to the anchors when coming from an external site', (done) => {

    document.body.innerHTML = `
    <h1>Marketing Parameter Forwarder</h1>
    <ul>
      <li>
        <a href="index.html">Home</a>
        <a href="page_1.html">Internal page</a>
        <a id="externalAnchor" href="https://www.externalsite.com/" forward-search-params trackable>External page</a>
      </li>
    </ul>
    `;

    const internalDomain = 'https://localhost:44333/';
    const externalDomain = 'https://www.externalsite.com/';
    const expectedStatusMessages = [
      'marketing_assets_status_checking_if_external_source',
      'marketing_assets_status_updating_cookies',
      'marketing_assets_status_updating_marketing_elements',
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
    const impressionDelegate: (target: Element) => void =  jest.fn((target: Element) => {});
    const clickDelegate: (ev: MouseEvent) => any = jest.fn((ev: MouseEvent) => {});
    
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
      [
        'utm_source',
        'utm_medium',
        'utm_campaign',
        'utm_term',
        'utm_content',
      ],
      clickDelegate,
      impressionDelegate,
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
