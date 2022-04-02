'use strict';

export function updateCtasWithMarketingParametersUseCase(
  cookie: string,
  target: HTMLElement,
  eligibleParameters: string[],
) {
  
}

function getCookieValue(name: string, cookie: string) {
  return cookie.match(`(^|;)\\s*${name}\\s*=\\s*([^;]+)`)?.pop() || '';
}
