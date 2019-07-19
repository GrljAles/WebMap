export default {
  endpoint: 'backend',
  configureEndpoints: ['basemap'],

// SPA related options
// ===================

  // The SPA url to which the user is redirected after a successful login
  loginRedirect : '#/basemap',
  // The SPA url to which the user is redirected after a successful logout
  logoutRedirect : '#/',

  // The SPA route used when an unauthenticated user tries to access an SPA page that requires authentication
  loginRoute : '#/',
  // Whether or not an authentication token is provided in the response to a successful signup
  loginOnSignup : false,
  // If loginOnSignup == false: The SPA url to which the user is redirected after a successful signup (else loginRedirect is used)
  signupRedirect : '#/notificationredirect',
  // reload page when token expires. 0 = don't reload (default), 1 = do reload page
  expiredReload : 1,
  // reload page when storage changed aka login/logout in other tabs/windows. 0 = don't reload (default), 1 = do reload page
  storageChangedReload : 1,

// API related options
// ===================

  // The base url used for all authentication related requests, including provider.url below.
  // This appends to the httpClient/endpoint base url, it does not override it.
  baseUrl : '/',
  // The API endpoint to which login requests are sent
  loginUrl : '/login',
  // The API endpoint to which logout requests are sent (not needed for jwt)
  //logoutUrl : '/logout/access',
  // The HTTP method used for 'logout' requests (Options: 'get' or 'post')
  //logoutMethod : 'post',
  // The API endpoint to which signup requests are sent
  signupUrl : '/registration',
  // The API endpoint used in profile requests (inc. `find/get` and `update`)
  //profileUrl : '/myprofile',
  // The method used to update the profile ('put' or 'patch')
  //profileMethod : 'put',
  // The API endpoint used with oAuth to unlink authentication
  //unlinkUrl : '/auth/unlink/',
  // The HTTP method used for 'unlink' requests (Options: 'get' or 'post')
  //unlinkMethod : 'get';

// Token Options
// =============

  // The header property used to contain the authToken in the header of API requests that require authentication
  authHeader : 'Authorization',
  // The token name used in the header of API requests that require authentication
  authTokenType : 'Bearer',
  // Logout when the token is invalidated by the server
  logoutOnInvalidToken : true,
  // The property from which to get the access token after a successful login or signup
  accessTokenProp : 'access_token',
  
// Refresh Token Options
// =====================

  // The API endpoint to which refreshToken requests are sent. null = loginUrl
  refreshTokenUrl : '/token/refresh',
  // Option to turn refresh tokens On/Off
  useRefreshToken : true,
  // The option to enable/disable the automatic refresh of Auth tokens using Refresh Tokens
  autoUpdateToken : true,
  refreshMethod: 'post',
  // Oauth Client Id
  //clientId : false,
  // Oauth Client secret
  //clientSecret : null,
  // The property from which to get the refresh token after a successful token refresh
  refreshTokenProp : 'refresh_token',
  // The property name used to send the existing token when refreshing `{ "refreshTokenSubmitProp": '...' }`
  refreshTokenSubmitProp : 'refresh_token',
  // Option to maintain unchanged response properties. This allows to work with a single refresh_token that was received once and the expiration only is extended
  keepOldResponseProperties : true,

// Id Token Options
// =====================

  // The property name from which to get the user authentication token. Can also be dotted "anIdTokenProp.anIdTokenName"
  //idTokenProp : 'id_token',

// Miscellaneous Options
// =====================

  // Whether to enable the fetch interceptor which automatically adds the authentication headers
  // (or not... e.g. if using a session based API or you want to override the default behaviour)
  httpInterceptor : true,
  // For OAuth only: Tell the API whether or not to include token cookies in the response (for session based APIs)
  //withCredentials : true;
  // Controls how the popup is shown for different devices (Options: 'browser' or 'mobile')
  //platform : 'browser';
  // Determines the `window` property name upon which aurelia-authentication data is stored (Default: `window.localStorage`)
  storage : 'localStorage',
  // The key used for storing the authentication response locally
  storageKey : 'aurelia_authentication',
  // full page reload if authorization changed in another tab (recommended to set it to 'true')
  storageChangedReload : true,
  // optional function to extract the expiration date. Takes the server response as parameter and returns NumericDate = number of seconds! since 1 January 1970 00:00:00 UTC (Unix Epoch)
  // eg (expires_in in sec): getExpirationDateFromResponse = serverResponse => new Date().getTime() / 1000 + serverResponse.expires_in;
  //getExpirationDateFromResponse : null,
  // optional function to extract the access token from the response. Takes the server response as parameter and returns a token
  // eg: getAccessTokenFromResponse = serverResponse => serverResponse.data[0].access_token;
  getAccessTokenFromResponse : 'access_token',
  // optional function to extract the refresh token from the response. Takes the server response as parameter and returns a token
  // eg: getRefreshTokenFromResponse = serverResponse => serverResponse.data[0].refresh_token;
  getRefreshTokenFromResponse : 'refresh_token',

  // List of value-converters to make global
  globalValueConverters : ['authFilterValueConverter'],

  // Default headers for login and token-update endpoint
   defaultHeadersForTokenRequests : {
    'Accept': 'application/json',
    'Content-Type': 'application/json',
   // 'Authorization': 'Bearer'
  }
};
