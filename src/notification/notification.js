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
      console.log(data)
      this.setData(data);
    });
    //here you recieve data and turn on alerts
  }

  setData(data) {
    this.notificationText = data;
    this.showNotification = true;
  }
  closeNotification() {
    this.showNotification = false;
  }
}
