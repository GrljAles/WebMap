import {PLATFORM} from 'aurelia-pal';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-dependency-injection';
import {AuthenticateStep} from 'aurelia-authentication';
import {sideNav} from "./sideNav/sideNav"

@inject(EventAggregator)
export class App {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.sideNav = sideNav;
    this.authenticated = false;
    this.userNameDisplay = null
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.userNameDisplay = data.userName;
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated
    });
  }
  logout() {
    this.ea.publish('logout', true)
  }

  configureRouter(config, router){
    config.title = 'WebMapProject';

    config.addPipelineStep('authorize', AuthenticateStep); // Add a route filter so only authenticated uses are authorized to access some routes
    config.map([
      {
        route: ["/", "login"],
        moduleId: PLATFORM.moduleName('login'),
        title: 'Login',
        name:'login',

      },
      {
        route: 'registration',
        moduleId: PLATFORM.moduleName('registration'),
        title: 'Registration',
        name:'registration',

      },
      {
        route: 'basemap',
        moduleId: PLATFORM.moduleName('basemap'),
        title: 'BaseMap',
        name:'basemap',
        auth: true
      },
      {
        route: 'confirmemail',
        moduleId: PLATFORM.moduleName('./comfirmemail/confirmemail'),
        title: 'Email Address Confirmation',
        name:'confirmemail'
      }
    ]);
    this.router = router;

  }
}
