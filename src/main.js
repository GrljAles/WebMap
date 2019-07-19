import environment from './environment';
import {PLATFORM} from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import 'materialize-css';
import authConfig from './authConfig';
import * as locations from "./resources/locations/locations.json";

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .globalResources(PLATFORM.moduleName('aurelia-authentication/authFilterValueConverter'))
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), b => b.useAll())
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-api'), config => {
      // Register hosts
      config.registerEndpoint('backend', 'http://' + locations.backend + '/backend');
      config.registerEndpoint('basemap','http://' + locations.backend + '/basemap');
      config.registerEndpoint('login','http://' + locations.backend + '/backend/login');
      config.registerEndpoint('registration','http://' + locations.backend + '/backend/registration');
      config.registerEndpoint('confirmemailnotification','http://' + locations.backend + '/emailOk');
      config.registerEndpoint('notificationredirect','http://' + locations.backend + '/notificationredirect');
      config.registerEndpoint('refreshtoken','http://' + locations.backend + '/backend/token/refresh');
      config.registerEndpoint('changeemail','http://' + locations.backend + '/changeemail');
      config.registerEndpoint('changepassword','http://' + locations.backend + '/changepassword');
    })
    /* configure aurelia-authentication */
    .plugin(PLATFORM.moduleName('aurelia-authentication'), config => {
      config.configure(authConfig);
    });
  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));
  aurelia.use.developmentLogging(environment.debug ? 'debug' : 'warn');

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  return aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
