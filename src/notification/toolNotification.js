import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as toolNotifications from './toolNotification.json';

@inject(EventAggregator)
export class ToolNotification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.errorMessages = toolNotifications.default;
    this.subscribe();
  }
  subscribe() {
    // this.ea.subscribe('notification-data', (data) => {
    //   this.setData(data);
    // });
    this.ea.subscribe('open-tool-notification', notificationStatus => {
      this.toolError = notificationStatus.errorWindow;
      this.errorMessage = this.errorMessages[notificationStatus.errorMessage];
    });
  }

/*   setData(data) {
    this.notificationText = data;
    this.showNotification = true;
  } */
  closeNotification() {
    this.errorMessage = null;
    this.ea.publish('close-tool-notification', false);
  }
}
