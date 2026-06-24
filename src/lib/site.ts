export const SITE_URL = "https://www.movingmulch.com";

export function absoluteUrl(pathname = "/") {
  return new URL(pathname, SITE_URL).toString();
}
