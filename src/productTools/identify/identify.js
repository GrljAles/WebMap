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
    this.ea.publish('delete-identify-features', {idsToDelete: -1});
  }

  getPixelValue(id, pixelValue, clickedCoordinates, productTitle, productDate) {
    // First round the value and coordiantes to 2 deccimal places as they are only used for display here
    clickedCoordinates[0] = + clickedCoordinates[0].toFixed(2);
    clickedCoordinates[1] = + clickedCoordinates[1].toFixed(2);
    if (typeof pixelValue === 'string') {}
    else {
      pixelValue = + pixelValue.toFixed(2);
    }
    
    // Construct table row object as new array so we can merge it with this.identifyArray.
    this.identifyElement = [{
      id: id,
      name: "Name",
      product: productTitle,
      date: productDate,
      coordinates: clickedCoordinates,
      value: pixelValue
    }];

    // Add table row object to list of all objects with Array.prototype.push.apply() method, so Aurelia can keep track of changes of the array and update the view-model.
    Array.prototype.push.apply(this.identifyArray, this.identifyElement);
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

  downloadResults() {
    // Table is an array so we have to convert it to object first
    let downloadTableObject = {};
    for(let row in this.identifyArray) {
      downloadTableObject[row] = this.identifyArray[row];
    }
    // Create URIcomponent and download as json
    this.uriContent = "data:application/json;filename=identifyTable.json," + encodeURIComponent(JSON.stringify(downloadTableObject));
    window.open(uriContent, 'identifyTable.json');
  }
}
