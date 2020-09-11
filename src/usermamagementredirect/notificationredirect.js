import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Confirmemail {
  constructor(eventAggregator) {
    this.ea = eventAggregator;

    this.userManagementNotification = null;
    this.okButton = null;
    this.subscribe();
  }

  subscribe(){
    this.ea.subscribe('user-management-notification', (data) => {
      this.userManagementNotification = data
      this.okButton = data.backButton;
    });
  }
}
