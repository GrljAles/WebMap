import {PLATFORM} from 'aurelia-pal';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-dependency-injection';
import {AuthenticateStep} from 'aurelia-authentication';
import {sideNav} from './sideNav/sideNav';
import * as locations from './resources/locations/locations.json';
import {AuthService} from 'aurelia-authentication';
import {HttpClient} from 'aurelia-fetch-client';
import {I18N} from 'aurelia-i18n';

@inject(AuthService, EventAggregator, HttpClient, I18N)
export class App {
  constructor(authService, eventAggregator, httpClient, i18n) {
    this.httpClient = httpClient;
    this.authService = authService;
    this.ea = eventAggregator;
    this.sideNav = sideNav;
    this.i18n = i18n;

    if (window.localStorage.getItem("aurelia_authentication")) {
      this.userNameDisplay = JSON.parse(window.localStorage.getItem("aurelia_authentication")).userName;
      this.userEmailDisplay = JSON.parse(window.localStorage.getItem("aurelia_authentication")).email;
    }
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.userNameDisplay = data.userName;
      this.userEmailDisplay = data.email;
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated;
    });
  }
  attached()  {
    this.authenticated = this.authService.authenticated;
  }
  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  logout() {
    let refreshToken = {
      jti: this.authService.getRefreshToken()
    };
    let accessToken = {
      jti: this.authService.getAccessToken()
    };

    this.httpClient.fetch('http://' + locations.backend + '/backendapi/logout/refresh', {
      method: 'POST',
      body: JSON.stringify(refreshToken),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getRefreshToken()
        //'Access-Control-Allow-Origin': 'http://localhost:8080'
      },
      mode: 'cors'
    });

    this.httpClient.fetch('http://' + locations.backend + '/backendapi/logout/access', {
      method: 'POST',
      body: JSON.stringify(accessToken),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getAccessToken()
        //'Access-Control-Allow-Origin': 'http://localhost:8080'
      },
      mode: 'cors'
    })
    return this.authService.logout();
  }


  refresh() {
    this.authService.updateToken();
  }
  changeEmailNavigate() {
    this.router.navigate('changeemail');
  }
  changePasswordNavigate() {
    this.router.navigate('changepassword');
  }
  refreshToken() {
    this.authService.updateToken();
  }

  changeLanguage(language) {
    this.i18n.setLocale(language);
  }

  configureRouter(config, router) {
    config.title = 'Sattilia';

    config.addPipelineStep('authorize', AuthenticateStep); // Add a route filter so only authenticated uses are authorized to access some routes
    config.map([
      {
        route: ['', 'login'],
        moduleId: PLATFORM.moduleName('./login'),
        title: 'Login',
        name: 'login',
      },
      {
        route: 'registration',
        moduleId: PLATFORM.moduleName('./registration'),
        title: 'Registration',
        name: 'registration',
      },
      {
        route: 'basemap',
        moduleId: PLATFORM.moduleName('./basemap'),
        title: 'BaseMap',
        name: 'basemap',
        auth: true
      },
      {
        route: 'emailok',
        moduleId: PLATFORM.moduleName('./usermamagementredirect/emailOk'),
        title: 'Confirm Email',
        name: 'emailok'
      },
      {
        route: 'emailnotok',
        moduleId: PLATFORM.moduleName('./usermamagementredirect/emailNotOk'),
        title: 'Confirm Email',
        name: 'emailnotok'
      },
      {
        route: 'emailconfirmed',
        moduleId: PLATFORM.moduleName('./usermamagementredirect/emailConfirmed'),
        title: 'Confirm Email',
        name: 'emailconfirmed'
      },
      {
        route: 'requestresetpassword',
        moduleId: PLATFORM.moduleName('./resetpassword/requestresetpassword'),
        title: 'Your email',
        name: 'requestresetpassword'
      },
      {
        route: 'resetpassword',
        moduleId: PLATFORM.moduleName('./resetpassword/resetpassword'),
        title: 'Your email',
        name: 'resetpassword'
      },
      {
        route: 'notificationredirect',
        moduleId: PLATFORM.moduleName('./usermamagementredirect/notificationredirect'),
        title: 'Notice',
        name: 'notificationredirect'
      },
      {
        route: 'changeemail',
        moduleId: PLATFORM.moduleName('./changeemail/changeemail'),
        title: 'Update Email',
        name: 'changeemail',
        auth: true
      },
      {
        route: 'changepassword',
        moduleId: PLATFORM.moduleName('./changepassword/changepassword'),
        title: 'Update Password',
        name: 'changepassword',
        auth: true
      }
    ]);
    this.router = router;
  }
}
