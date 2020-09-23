import environment from './environment';
import {PLATFORM} from 'aurelia-pal';
import * as Bluebird from 'bluebird';
import 'materialize-css';
import authConfig from './authConfig';
import * as locations from './resources/locations/locations.json';
import resBundle from 'i18next-resource-store-loader!./assets/i18n/index.js';
import {I18N, TCustomAttribute} from 'aurelia-i18n';
import Backend from 'i18next-xhr-backend'; // <-- your previously installed backend plugin
import LngDetector from 'i18next-browser-languagedetector';

// remove out if you don't want a Promise polyfill (remove also from webpack.config.js)
Bluebird.config({ warnings: { wForgottenReturn: false } });

export function configure(aurelia) {
  aurelia.use
    .standardConfiguration()
    .globalResources(PLATFORM.moduleName('aurelia-authentication/authFilterValueConverter'))
    .globalResources(PLATFORM.moduleName('productTools/identify/identi-fy'))
    .globalResources(PLATFORM.moduleName('notification/toolNotification'))
    .globalResources(PLATFORM.moduleName('preloader/toolPreloader'))
    .globalResources(PLATFORM.moduleName('notification/userNotification'))
    .feature(PLATFORM.moduleName('resources/index'))
    .plugin(PLATFORM.moduleName('aurelia-materialize-bridge'), b => b.useAll())
    .plugin(PLATFORM.moduleName('aurelia-validation'))
    .plugin(PLATFORM.moduleName('aurelia-api'), config => {
      // Register hosts
      config.registerEndpoint('backendapi', 'http://' + locations.backend + '/backendapi');
      config.registerEndpoint('basemap', 'http://' + locations.backend + '/basemap');
      config.registerEndpoint('login', 'http://' + locations.backend + '/backendapi/login');
      config.registerEndpoint('registration', 'http://' + locations.backend + '/backendapi/registration');
      config.registerEndpoint('confirmemailnotification', 'http://' + locations.backend + '/emailOk');
      config.registerEndpoint('notificationredirect', 'http://' + locations.backend + '/notificationredirect');
      config.registerEndpoint('refreshtoken', 'http://' + locations.backend + '/backendapi/token/refresh');
      config.registerEndpoint('changeemail', 'http://' + locations.backend + '/changeemail');
      config.registerEndpoint('changepassword', 'http://' + locations.backend + '/changepassword');
    })
    /* configure aurelia-authentication */
    .plugin(PLATFORM.moduleName('aurelia-authentication'), config => {
      config.configure(authConfig);
    })

  // Uncomment the line below to enable animation.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-animator-css'));
  // if the css animator is enabled, add swap-order="after" to all router-view elements

  // Anyone wanting to use HTMLImports to load views, will need to install the following plugin.
  // aurelia.use.plugin(PLATFORM.moduleName('aurelia-html-import-template-loader'));
    .developmentLogging(environment.debug ? 'debug' : 'warn')
    .plugin(PLATFORM.moduleName('aurelia-i18n'), instance => {
      // register backend plugin
      instance.i18next
        .use(Backend)
        .use(LngDetector);

      let aliases = ['t', 'i18n'];
      TCustomAttribute.configureAliases(aliases);
      return instance.setup({
        resources: resBundle,
        detection: {
          order: ['localStorage', 'cookie', 'navigator'],
          lookupCookie: 'i18next',
          lookupLocalStorage: 'i18nextLng',
          caches: ['localStorage', 'cookie']
        },
        attributes: aliases,
        language: 'si',
        fallbackLng: 'en',
        debug: false
      });
    });

  if (environment.testing) {
    aurelia.use.plugin(PLATFORM.moduleName('aurelia-testing'));
  }

  return aurelia.start().then(() => aurelia.setRoot(PLATFORM.moduleName('app')));
}
