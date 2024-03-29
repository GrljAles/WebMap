import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {AuthService} from 'aurelia-authentication';
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import * as dataData from '../../resources/dataData/dataData.json';
import * as locations from '../../resources/locations/locations.json';
import {ChartEl} from './chart-el';

@inject(EventAggregator, HttpClient, AuthService, ChartEl)
export class TsChart {
  constructor(eventAggregator, httpClient, authService, chartEl) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.chartel = chartEl;

    this.activeLayer = 0;
    this.layers = dataData.default;
    this.startingDateIndex = 0;
    this.endingDateIndex = this.layers[this.activeLayer].availableDates.length - 1;
    this.subscribe();
  }
  subscribe() {
    this.ea.subscribe('activeLayerChanged', data => {
      this.activeLayer = data;
    });
    this.ea.subscribe('this-is-tsPoints-table', table => {
      this.pointsTable = table;
    });
  }

  attached() {
    let _this = this;
    if (this.tsDatesSlider) {
      this.tsDatesSlider.noUiSlider.destroy();
    }
    this.tsDatesSlider = document.getElementById('ts-date-slider');
    noUiSlider.create(this.tsDatesSlider, {
      start: [0, this.layers[this.activeLayer].availableDates.length - 1],
      step: 1,
      orientation: 'horizontal',
      //tooltips: [true, true],
      range: {
        'min': [0],
        'max': [this.layers[this.activeLayer].availableDates.length - 1]
      },
      pips: {
        mode: 'count',
        values: this.layers[this.activeLayer].availableDates.length,
        density: -1,
        format: {
          to: function(a) {
            return _this.layers[_this.activeLayer].availableDates[a];
          }
        }
      },
      connect: true,
      behaviour: 'drag-tap'
    });

    this.tsDatesSlider.noUiSlider.on('end', function(values) {
      _this.startingDateIndex = parseInt(values[0]);
      _this.endingDateIndex = parseInt(values[1]);
    });
  }

  getPointsTable() {
    return this.identify.publishToolTable('tsPoints')
  }

  tsChartRequest() {
    this.ea.publish('open-tool-preloader', {
      preloaderWindow: true,
      toolPreloaderMessage: 'TSChart'
    });
    let datas = {
      data: {},
      legendDisplay: true,
      xAxisType: 'time',
      xAxisUnit: 'day'
    };
    this.ea.publish('get-ts-table', 'tsPoints');
    if (this.pointsTable.length > 0) {
      this.ea.publish('ts-chart-window-changed', true);
      this.tsChartParams = {
        "startingDateIndex": this.layers[this.activeLayer].availableDates[this.startingDateIndex],
        "endingDateIndex": this.layers[this.activeLayer].availableDates[this.endingDateIndex],
        "points": this.pointsTable,
        "product": this.layers[this.activeLayer].name
      };
      this.httpClient.fetch(locations.backend + '/backendapi/tschartpoints', {
        method: 'POST',
        body: JSON.stringify(this.tsChartParams),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'Fetch',
          'Authorization': 'Bearer ' + this.authService.getAccessToken()
        },
        mode: 'cors'
      })
        .then(response => {
          return response.text();
        })
        .then(data => {
          let tsChart = JSON.parse(data);
          datas.data = tsChart;
          this.chartel.updateChart(datas);
          this.ea.publish('close-tool-preloader', {
            preloaderWindow: false
          });
          this.pointsTable =  null;
        })
        .catch(error => {
          this.ea.publish('close-tool-preloader', {
            preloaderWindow: false
          });
          this.ea.publish('open-tool-notification', {
            errorWindow: true,
            errorMessage: 'genericBackend'
          });
        });
    }
  }
}
