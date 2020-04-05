import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';
import {AuthService} from 'aurelia-authentication';
import * as dataData from '../../resources/dataData/dataData.json';

@inject(EventAggregator, HttpClient, AuthService)
export class IdentiFy {
  constructor(eventAggregator, httpClient, authService) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.activeTable = null,
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
      }
    };
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('add-table-row', (data) => {
      this.getPixelValue(data.layer, data.row);
    });
    this.ea.subscribe('activeTableChanged', data => {
      this.activeTable = data;
    });
  }

  attached() {}

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
    this.resultsTables[whichTable].table.splice(idIndex, 1);
    this.ea.publish('delete-tool-features', {layer: whichTable, idsToDelete: idIndex});
  }

  downloadResults(geoJsonStr) {
    // Create URIcomponent and download as json
    this.uriContent = "data:application/json;filename=identifyTable.json," + encodeURIComponent(geoJsonStr);
    window.open(uriContent, 'identifyTable.json');
  }
}
