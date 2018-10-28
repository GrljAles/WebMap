export default {
  endpoint: 'auth',              // use 'auth' endpoint for the auth server
  configureEndpoints: ['auth'],  // add Authorization header to 'auth' endpoint
  storageChangedReload: true,    // ensure secondary tab reloading after auth status changes
  facebook: {
    name: 'facebook',
    clientId: 309371932996892,
    url: '/auth/facebook',
    authorizationEndpoint: 'https://www.facebook.com/v2.5/dialog/oauth',
    redirectUri: window.location.origin + '/',
    requiredUrlParams: ['display', 'scope'],
    scope: ['email'],
    scopeDelimiter: ',',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 580, height: 400 }
  },
  google: {
    name: 'google',
    url: '/auth/google',
    client_id: '1018623425414-1t0ehh2lquqsk1ggb4tro3jb9b8gg1of.apps.googleusercontent.com',
    authorizationEndpoint: 'https://accounts.google.com/o/oauth2/auth',
    redirectUri: window.location.origin,
    requiredUrlParams: ['scope'],
    optionalUrlParams: ['display', 'state'],
    scope: ['profile', 'email'],
    scopePrefix: 'openid',
    scopeDelimiter: ' ',
    display: 'popup',
    oauthType: '2.0',
    popupOptions: { width: 452, height: 633 },
    state: function() {
      let rand = Math.random().toString(36).substr(2);
      return encodeURIComponent(rand);
    }
  }
}
