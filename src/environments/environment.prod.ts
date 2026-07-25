export const environment = {
  production: true,
  /**
   * The deployed build has no API behind it, so authentication runs against
   * LocalAuthBackend (localStorage). Point `apiUrl` at a real deployment and
   * set this to true to use the HTTP implementation instead.
   */
  useRemoteAuth: false,
  apiUrl: 'http://localhost:1000',
};
