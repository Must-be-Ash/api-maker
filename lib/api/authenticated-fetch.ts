/**
 * Makes an authenticated API request with CDP access token
 * @param url API endpoint
 * @param accessToken CDP access token
 * @param options Fetch options
 * @returns Response from the API
 */
export async function authenticatedFetch(
  url: string,
  accessToken: string | null,
  options: RequestInit = {}
): Promise<Response> {
  const headers = new Headers(options.headers);

  if (accessToken) {
    headers.set('Authorization', `Bearer ${accessToken}`);
  }

  return fetch(url, {
    ...options,
    headers,
  });
}
