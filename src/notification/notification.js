import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class Notification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('notification-data', (data) => {
      this.notificationText = data;
      this.showNotification = true;
    });
  }

  closeNotification() {
    this.notificationText = null;
    this.showNotification = false;
  }
}
