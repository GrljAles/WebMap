import {PLATFORM} from 'aurelia-pal';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-dependency-injection';
import {AuthenticateStep} from 'aurelia-authentication';
import {sideNav} from "./sideNav/sideNav"

@inject(EventAggregator, sideNav)
export class App {
  constructor(eventAggregator, sideNav) {
    this.ea = eventAggregator;
    this.sideNav = sideNav;
    this.authenticated = false;
    this.userNameDisplay = null
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.updateUserData(data)
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated
    });
  }
  logout() {
    //this.sideNav.openSideNav()
    this.ea.publish('logout', true)
  }
  updateUserData(data){
    this.userNameDisplay = data.userName;
  }
  configureRouter(config, router){
    config.title = 'WebMapProject';

    config.addPipelineStep('authorize', AuthenticateStep); // Add a route filter so only authenticated uses are authorized to access some routes
    config.map([
      {
        route: ["", "home"],
        moduleId: PLATFORM.moduleName('login'),
        title: 'Login',
        name:'login',

      },
      {
        route: 'register',
        moduleId: PLATFORM.moduleName('register'),
        title: 'Register',
        name:'register',

      },
      {
        route: 'basemap',
        moduleId: PLATFORM.moduleName('basemap'),
        title: 'BaseMap',
        name:'basemap',
        auth: true
      },
      /* {
        route: 'sidenav',
        moduleId: PLATFORM.moduleName('./sideNav/sideNav'),
        title: 'Side Navigation',
        name:'sidenav',
        auth: true
      }, */
    ]);
    this.router = router;

  }
}
