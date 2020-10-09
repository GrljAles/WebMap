import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';

@inject(EventAggregator, Router)
export class UserNotification {
  constructor(eventAggregator, router) {
    this.ea = eventAggregator;
    this.router = router;

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
    this.ea.publish('close-user-notification', false);
    if (this.userMessage === 'confirmation-mail-sent') {
      this.router.navigateToRoute('login');
    }
    this.userMessage = null;
  }
}
