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
    this.subscribe();
  }

  subscribe() {}

  toggleIdentifyButton() {
    this.indentifyButtonActive = !this.indentifyButtonActive;
    this.ea.publish('identify-button-trigger', {identifyButon: this.indentifyButtonActive});
  }

  displayIdentifyResultWindow() {
    if (!this.identifyResultWindow) {
      this.identifyResultWindow = true;
    }
  }

  closeIdentifyResultWindow() {
    if (this.identifyResultWindow) {
      this.identifyResultWindow = false;
    }
  }

  confirmDeleteTable() {
    this.deleteTable = !this.deleteTable;
  }

  doNotDeleteTable() {
    this.deleteTable = false;
  }

  yesDeleteTable() {
    this.deleteTable = false;
    this.identifyResultWindow = false;
    this.identifyArray = [];
    this.tableId = 0;
    this.ea.publish('delete-identify-features', {idsToDelete: 'all'});
  }

  getPixelValue(rowJson) {
    // First round the value and coordiantes to 2 deccimal places as they are only used for display here
    rowJson.coordinates[0] = + rowJson.coordinates[0].toFixed(2);
    rowJson.coordinates[1] = + rowJson.coordinates[1].toFixed(2);
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
    // Table is an array so we have to convert it to object first
/*     let downloadTableObject = {};
    for(let row in this.identifyArray) {
      downloadTableObject[row] = this.identifyArray[row];
    } */
    // Create URIcomponent and download as json
    this.uriContent = "data:application/json;filename=identifyTable.json," + encodeURIComponent(geoJsonStr);
    window.open(uriContent, 'identifyTable.json');
  }
}
