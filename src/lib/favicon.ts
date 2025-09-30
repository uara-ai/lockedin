/**
 * Utility functions for working with favicons
 */

/**
 * Get a favicon URL from Google's favicon service
 * @param websiteUrl - The website URL to get the favicon for
 * @param size - The size of the favicon (default: 64)
 * @returns The Google favicon service URL
 */
export function getGoogleFavicon(
  websiteUrl: string,
  size: number = 64
): string {
  try {
    // Extract domain from URL
    const url = new URL(websiteUrl);
    const domain = url.hostname;

    // Use Google's favicon service
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=${size}`;
  } catch (error) {
    // If URL is invalid, return a default placeholder
    return `https://www.google.com/s2/favicons?domain=example.com&sz=${size}`;
  }
}

/**
 * Get a favicon URL with fallback support
 * @param websiteUrl - The website URL to get the favicon for
 * @param size - The size of the favicon (default: 64)
 * @returns An object with the primary favicon URL and fallback
 */
export function getFaviconWithFallback(websiteUrl: string, size: number = 64) {
  const primaryUrl = getGoogleFavicon(websiteUrl, size);
  const fallbackUrl =
    "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='64' height='64' viewBox='0 0 24 24' fill='none' stroke='%23666' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Ccircle cx='12' cy='12' r='10'/%3E%3Cpath d='M8 14s1.5 2 4 2 4-2 4-2'/%3E%3Cline x1='9' y1='9' x2='9.01' y2='9'/%3E%3Cline x1='15' y1='9' x2='15.01' y2='9'/%3E%3C/svg%3E";

  return {
    primary: primaryUrl,
    fallback: fallbackUrl,
  };
}

/**
 * Extract domain name from URL for display purposes
 * @param websiteUrl - The website URL
 * @returns The domain name without protocol
 */
export function getDomainFromUrl(websiteUrl: string): string {
  try {
    const url = new URL(websiteUrl);
    return url.hostname.replace("www.", "");
  } catch (error) {
    return websiteUrl;
  }
}

// Cursor rules applied correctly.
