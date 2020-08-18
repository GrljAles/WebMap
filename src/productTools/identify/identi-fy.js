import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {AuthService} from 'aurelia-authentication';
import * as dataData from '../../resources/dataData/dataData.json';

let instance = null;

@inject(EventAggregator, HttpClient, AuthService)
export class IdentiFy {
  constructor(eventAggregator, httpClient, authService) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.activeTable = null;
    this.layers = dataData.default;
    this.resultsTables = {
      identifyPoints: {
        delete: false,
        table: [],
        tableId: 0,
        tableHeader: ['Id', 'Product', 'Date', 'Value'],
        tableTitle: 'RESULTS TABLE',
        tableIcon: 'details'
      },
      zonalStatsPolygons: {
        delete: false,
        table: [],
        tableId: 0,
        tableHeader: ['Id', 'Product', 'Date', 'Min', 'Max', 'Mean', 'Std', 'Range'],
        tableTitle: 'RESULTS TABLE',
        tableIcon: 'dashboard'
      },
      tsPoints: {
        delete: false,
        table: [],
        tableId: 0,
        tableHeader: ['Id', 'Product', 'X', 'Y'],
        tableTitle: 'REQUESTED POINTS FOR TIME SERIES',
        tableIcon: 'timeline'
      },
      zonalTSPolygons: {
        delete: false,
        table: [],
        tableId: 0,
        tableHeader: ['Id', 'Product', 'Area'],
        tableTitle: 'REQUESTED POLYGON FOR TIME SERIES',
        tableIcon: 'multiline_chart'
      }
    };
    this.subscribe();

    if (!instance) {
      instance = this;
    }
    return instance;
  }

  subscribe() {
    this.ea.subscribe('add-table-row', (data) => {
      this.getPixelValue(data.layer, data.row);
    });

    this.ea.subscribe('activeTableChanged', data => {
      this.activeTable = data;
    });
    this.ea.subscribe('get-ts-table', whichTable => {
      this.publishToolTable(whichTable)
    });
    this.ea.subscribe('this-is-selected-table-geojson', geoJsonStr => {
      this.downloadResults(geoJsonStr);
    });
  }

  attached() {}

  publishToolTable(whichTable) {
    this.ea.publish('this-is-' + whichTable + '-table', this.resultsTables[whichTable].table);
  }

  confirmDeleteTable(whichTable) {
    this.resultsTables[whichTable].delete = !this.resultsTables[whichTable].delete;
  }

  doNotDeleteTable(whichTable) {
    this.resultsTables[whichTable].delete = false;
  }

  yesDeleteTable(whichTable) {
    this.resultsTables[whichTable].delete = false;
    this.resultsTables[whichTable].table = [];
    this.resultsTables[whichTable].tableId = 0;
    this.ea.publish('delete-tool-features', {layer: whichTable, idsToDelete: 'all'});
  }

  getPixelValue(whichTable, rowJson) {
    if (rowJson.value) {
      if (typeof rowJson.value === 'string') {}
      else {
        rowJson.value = + rowJson.value.toFixed(2);
      }      
    }
    // Add table row object to list of all objects with Array.prototype.push.apply() method, so Aurelia can keep track of changes of the array and update the view-model.
    Array.prototype.push.apply(this.resultsTables[whichTable].table, [rowJson]);
  }

  deleteResultsTableRow(whichTable, id) {
    // First create array of table element indices
    let idsArray = [];
    for (let element of this.resultsTables[whichTable].table) {
      idsArray.push(element.id);
    }
    // Get the index of passed id and delete one table element at that index
    let idIndex = idsArray.indexOf(id);
    Array.prototype.splice.apply(this.resultsTables[whichTable].table, [idIndex, 1]);
    this.ea.publish('delete-tool-features', {layer: whichTable, idsToDelete: idIndex});
  }

  requestGeojsonFromBasemap(whichLayer) {
    this.ea.publish('give-me-geojson', whichLayer)
  }

  downloadResults(geoJsonStr) {
    let a = window.document.createElement('a');
    let file = new Blob([geoJsonStr], {type: 'application/json'});
    a.href = URL.createObjectURL(file);
    a.download = 'identifyTable.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}
