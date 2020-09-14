import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class ToolPreloader {
  constructor(eventAggregator) {
    this.ea = eventAggregator;

    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('open-tool-preloader', preloaderStatus => {
      this.toolPreloader = preloaderStatus.preloaderWindow;
      this.toolPreloaderMessage = preloaderStatus.toolPreloaderMessage;
    });
  }
  closeNotification() {
    this.toolPreloaderMessage = null;
    this.ea.publish('close-tool-preloader', false);
  }
}
