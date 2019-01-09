import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Resetpasswordnotification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.userManagementNotification = null
    this.subscribe();
  }
  subscribe(){
    this.ea.subscribe('user-management-notification', (notification) => {
      this.userManagementNotification = notification;
    });
  }
}
