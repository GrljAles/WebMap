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
    this.identifyArray = [];
    this.identifyResultWindow = false;
    this.deleteTable = false;
    this.uriContent = "";
    this.buttonCheck = {
      refresh: {
        state: true,
        drawGeom: null,
      },
      identify: {
        state: false,
        drawGeom: 'Point'
      },
      zonalStat: {
        state: false,
        drawGeom: 'Polygon'
      },
      tsChart: {
        state: false,
        drawGeom: 'Point'
      },
      zonalTSChart: {
        state: false,
        drawGeom: 'Polygon'
      },
      profile: {
        state: false,
        drawGeom: 'Line'
      },
    };
    this.subscribe();
  }

  subscribe() {
    this.ea.subscribe('button-trigger', (data) => {
      this.toggleIdentifyButton(data)
    })
  }

  toggleIdentifyButton(data) {
    this.buttonCheck = data;
    // this.ea.publish('draw-trigger', button);
  }
/* 
  displayIdentifyResultWindow() {
    if (!this.identifyResultWindow) {
      this.identifyResultWindow = true;
    }
  } */

  confirmDeleteTable() {
    this.deleteTable = !this.deleteTable;
  }

  doNotDeleteTable() {
    this.deleteTable = false;
  }

  yesDeleteTable() {
    this.deleteTable = false;
    // this.identifyResultWindow = false;
    this.identifyArray = [];
    this.tableId = 0;
    this.ea.publish('delete-identify-features', {idsToDelete: 'all'});
  }

  getPixelValue(rowJson) {
    if (typeof rowJson.value === 'string') {}
    else {
      rowJson.value = + rowJson.value.toFixed(2);
    }
    // Add table row object to list of all objects with Array.prototype.push.apply() method, so Aurelia can keep track of changes of the array and update the view-model.
    Array.prototype.push.apply(this.identifyArray, [rowJson]);
  }

  deleteResultsTableRow(id) {
    // First create array of table element indices
    let idsArray = [];
    for (let element of this.identifyArray) {
      idsArray.push(element.id);
    }
    // Get the index of passed id and delete one table element at that index
    let idIndex = idsArray.indexOf(id);
    this.identifyArray.splice(idIndex, 1);
    this.ea.publish('delete-identify-features', {idsToDelete: idIndex});
  }

  downloadResults(geoJsonStr) {
    // Create URIcomponent and download as json
    this.uriContent = "data:application/json;filename=identifyTable.json," + encodeURIComponent(geoJsonStr);
    window.open(uriContent, 'identifyTable.json');
  }
}
