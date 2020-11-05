import {inject} from 'aurelia-framework';
import * as dataData from 'resources/dataData/dataData.json';
import {
  EventAggregator
} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class layerdescription {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.layers = dataData.default;
    this.activeLayer = 0;
    this.activeLayerTitle = 'EVI'
    this.layerIcon = this.getUrl(this.layers[0].icon)
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('activeLayerChanged', (data) => {
      this.updateLayerDescription(data)
    });
  }

  getUrl(name) {
    return require(`../resources/icons/${name}.svg`);
  }

  updateLayerDescription(id) {
    this.activeLayer = id;
    this.activeLayerTitle = this.layers[id].name;
    this.layerIcon = this.getUrl(this.layers[id].icon)
  }
}
