import {inject} from 'aurelia-framework';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import TileLayer from 'ol/layer/Tile.js';
import XYZ from 'ol/source/XYZ.js';
import Control from 'ol/control/Control.js'
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(EventAggregator)
export class BaseMap {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.userNameDisplay = null
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.userNameDisplay = data.userName;
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated
    });
  }

  attached() {
    this.basemap = new Map({
      target: 'basemap',
      layers: [
        new TileLayer({
          source: new XYZ({
            url: 'https://{a-c}.tile.openstreetmap.org/{z}/{x}/{y}.png'
          })
        })
      ],
      view: new View({
        center: [-472202, 7530279],
        zoom: 12
      })
    });
  }
}
