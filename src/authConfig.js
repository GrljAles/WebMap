export default {
  endpoint: 'auth',
  configureEndpoints: ['auth', 'protected-api'],
  loginUrl: 'http://84.255.193.232/backend/token',  
  signupUrl: 'http://84.255.193.232/backend/register',
  profileUrl: 'me',
  unlinkUrl: 'me/unlink',
  accessToken: 'access',
  refreshToken: 'refresh',
  loginOnSignup: true,
  storageChangedReload: true,    // ensure secondary tab reloading after auth status changes
  expiredRedirect: 1,            // redirect to logoutRedirect after token expiration
  authHeader : 'Authorization',
  authTokenType : 'Bearer',
  accessTokenProp : 'token',
  httpInterceptor : true,
  storage : 'localStorage',
  storageKey : 'aurelia_authentication',
  defaultHeadersForTokenRequests : {
    'Content-Type': 'application/json'
  },
  

};
