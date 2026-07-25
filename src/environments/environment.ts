export const environment = {
  production: false,
  /**
   * When false, authentication is served by LocalAuthBackend (localStorage) so
   * the sign-up / sign-in flow is playable with no server running. Flip it to
   * true to route the same flow through ApiService at `apiUrl` instead.
   */
  useRemoteAuth: false,
  apiUrl: 'http://localhost:1000',
};
