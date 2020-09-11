import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as toolPreloader from './toolPreloader.json';
import {I18N} from 'aurelia-i18n';

@inject(EventAggregator, I18N)
export class ToolPreloader {
  constructor(eventAggregator, i18n) {
    this.ea = eventAggregator;
    this.i18n = i18n;
    this.language = this.i18n.getLocale();
    this.preloaderMessages = toolPreloader.default[this.language];
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('open-tool-preloader', preloaderStatus => {
      this.toolPreloader = preloaderStatus.preloaderWindow;
      this.toolPreloaderMessage = this.preloaderMessages[preloaderStatus.toolPreloaderMessage];
    });
  }
  closeNotification() {
    this.toolPreloaderMessage = null;
    this.ea.publish('close-tool-preloader', false);
  }
}
