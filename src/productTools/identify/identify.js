import {
  EventAggregator
} from 'aurelia-event-aggregator';
import {inject} from 'aurelia-dependency-injection';
import * as locations from "../../resources/locations/locations.json";

@inject(EventAggregator)
export class IdentifyTool {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.indentifyButtonActive = false;
    this.identifyResultWindow = false;
    this.identifyArray = [];
    this.zonalStatsArray = [];
    this.uriContent = '';
    this.buttonCheck = {
      refresh: {
        state: true,
        drawGeom: null,
        reledLayer: null
      },
      identify: {
        state: false,
        drawGeom: 'Point',
        relatedLayer: 'identifyPoints'
      },
      zonalStat: {
        state: false,
        drawGeom: 'Polygon',
        relatedLayer: 'zonalStatsPolygons'
      },
      tsChart: {
        state: false,
        drawGeom: 'Point',
        relatedLayer: 'tsPoints'
      },
      zonalTSChart: {
        state: false,
        drawGeom: 'Polygon',
        relatedLayer: 'zonalTSPolygons'
      },
      profile: {
        state: false,
        drawGeom: 'LineString',
        relatedLayer: 'profileLine'
      }
    };
    this.resultsTables = {
      identifyPoints: {
        delete: false,
        table: [],
        tableId: 0
      },
      zonalStatsPolygons: {
        delete: false,
        table: [],
        tableId: 0
      }
    }
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('button-trigger', (data) => {
      this.toggleIdentifyButton(data);
    });
  }

  toggleIdentifyButton(data) {
    this.buttonCheck = data;
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
    if (typeof rowJson.value === 'string') {}
    else {
      rowJson.value = + rowJson.value.toFixed(2);
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
    console.log(geoJsonStr)
    // Create URIcomponent and download as json
    this.uriContent = "data:application/json;filename=identifyTable.json," + encodeURIComponent(geoJsonStr);
    window.open(uriContent, 'identifyTable.json');
  }
}
