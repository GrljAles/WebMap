import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as toolNotifications from './toolNotification.json';
import {I18N} from 'aurelia-i18n';

@inject(EventAggregator, I18N)
export class ToolNotification {
  constructor(eventAggregator, i18n) {
    this.ea = eventAggregator;
    this.i18n = i18n;
    this.language = this.i18n.getLocale();

    this.errorMessages = toolNotifications.default[this.language];
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('open-tool-notification', notificationStatus => {
      this.toolError = notificationStatus.errorWindow;
      this.errorMessage = this.errorMessages[notificationStatus.errorMessage];
    });
  }

  closeNotification() {
    this.errorMessage = null;
    this.ea.publish('close-tool-notification', false);
  }
}
