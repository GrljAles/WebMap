import {PLATFORM} from 'aurelia-pal';
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-dependency-injection';

@inject(EventAggregator)
export class App {
  userImage = false;
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    //this.userImage = false;
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('user-image', (data) => {
      this.topRowOnLogin(data)
    });
    //here you recieve data and turn on alerts
  }
  topRowOnLogin(data){
    this.userImage = data;
    if (this.userImage === true) {
      this.topRowStyle = 'col l11 m11 s11'
    }
    else {
      this.topRowStyle = 'col l12 m12 s12'
    }
  }
  configureRouter(config, router){
    config.title = 'WebMapProject';
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
      },
    ]);
    this.router = router;

  }
}
