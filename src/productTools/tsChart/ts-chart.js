import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {AuthService} from 'aurelia-authentication';
import * as locations from '../../../src/resources/locations/locations.json';
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import * as dataData from '../../resources/dataData/dataData.json';

@inject(EventAggregator, HttpClient, AuthService)
export class TsChart {
  constructor(eventAggregator, httpClient, authService) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.activeLayer = 0;
    this.layers = dataData.default;
    this.startingDateIndex = 0;
    this.endingDateIndex = this.layers[this.activeLayer].availableDates.length - 1;
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('activeLayerChanged', data => {
      this.activeLayer = data;
      console.log(this.layers[this.activeLayer].name)
    });

    this.ea.subscribe('layersChanged', data => {
      this.layers = data;
      console.log(this.layers)
    }); 
  }
  
  attached() {
    let _this = this;
    this.tsDatesSlider = document.getElementById('ts-date-slider');
    noUiSlider.create(this.tsDatesSlider, {
      start: [0, this.layers[this.activeLayer].availableDates.length - 1],
      step: 1,
      orientation: 'horizontal',
      tooltips: [true, true],
      range: {
        'min': [0],
        'max': [this.layers[this.activeLayer].availableDates.length - 1]
      },
      pips: {
        mode: 'range',
        density: 30
      },
      connect: true,
      behaviour: 'drag-tap'
    });

    this.tsDatesSlider.noUiSlider.on('end', function(values) {
      _this.startingDateIndex = values[0];
      _this.endingDateIndex = values[1];
      console.log(valueMin, valueMax);
    });
  }
  printDocument() {
    console.log(document)
  }
}
