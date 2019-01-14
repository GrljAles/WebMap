import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Confirmemail {
  constructor(eventAggregator) {
    this.ea = eventAggregator;

    this.userManagementNotification = null;
    this.okButtonRoute = 'login'
    this.subscribe();
  }

  subscribe(){
    this.ea.subscribe('user-management-notification', (notification) => {
      this.userManagementNotification = notification.message;
      this.okButtonRoute = notification.backbutton
      console.log(this.okButtonRoute)
    });
  }
}
