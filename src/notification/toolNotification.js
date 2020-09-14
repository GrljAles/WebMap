import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ToolNotification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;

    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('open-tool-notification', notificationStatus => {
      this.toolError = notificationStatus.errorWindow;
      this.errorMessage = notificationStatus.errorMessage;
    });
  }

  closeNotification() {
    this.errorMessage = null;
    this.ea.publish('close-tool-notification', false);
  }
}
