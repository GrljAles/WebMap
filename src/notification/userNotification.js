import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class UserNotification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;

    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('open-user-notification', notificationStatus => {
      if (notificationStatus.userMessage) {
        this.userMessage = notificationStatus.userMessage;
      }
      else {
        this.userMessage = "error-message-500"
      }
    });
  }

  closeNotification() {
    this.userMessage = null;
    this.ea.publish('close-user-notification', false);
  }
}
