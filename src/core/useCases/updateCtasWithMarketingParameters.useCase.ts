'use strict';

export function updateCtasWithMarketingParametersUseCase(
  cookie: string,
  target: HTMLElement,
  dataAttribute: string,
  eligibleParameters: string[],
) {
  const marketingParameters = [];
  eligibleParameters.forEach((parameter: string) => {
      const cookieValue: string = getCookieValue(parameter, cookie);

      if (cookieValue) {
        marketingParameters.push({name: parameter, value: cookieValue});
      }
    },
  );
  
  target
  .querySelectorAll(`a[${dataAttribute}]`)
  .forEach((anchor) => appendMarketingAttributesToLink(anchor as HTMLAnchorElement, marketingParameters));
}

function getCookieValue(name: string, cookie: string) {
  return cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';
}

function appendMarketingAttributesToLink(
  anchor: HTMLAnchorElement,
  // marketingParameters: { [key: string]: string; },
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
