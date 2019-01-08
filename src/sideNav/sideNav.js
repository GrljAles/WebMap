import { MdSidenav } from "aurelia-materialize-bridge";
import {EventAggregator} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-framework';

@inject(MdSidenav, EventAggregator)
export class sideNav {
  constructor(mdsidenav, eventaggregator) {
    this.sideNav = mdsidenav;
    this.ea = eventaggregator
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('open-sidenav', (data) => {
      this.openSideNav(data)
    });
  }
  openSideNav(data) {
    console.log(this.sideNavB)
    this.sideNav.open();
  }
}
