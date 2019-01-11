import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Confirmemail {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.subscribe();
  }

  subscribe(){
    this.ea.subscribe('user-management-notification', (notification) => {
      console.log(this.userManagementNotification)
      this.userManagementNotification = notification;
      console.log(this.userManagementNotification)
    });
  }
}
