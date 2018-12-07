import {PLATFORM} from 'aurelia-pal';
export class App {
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
