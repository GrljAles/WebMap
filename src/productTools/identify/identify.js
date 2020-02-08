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
    this.tableId = 0;
    this.deleteTable = false;
    this.subscribe();
  }

  subscribe() {}

  toggleIdentifyButton() {
    this.indentifyButtonActive = !this.indentifyButtonActive;
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
  }

  getPixelValue(pixelValue, clickedCoordinates, productTitle, productDate) {
    // First round the value and coordiantes to 2 deccimal places as they are only used for display here
    clickedCoordinates[0] = + clickedCoordinates[0].toFixed(2);
    clickedCoordinates[1] = + clickedCoordinates[1].toFixed(2);
    pixelValue = + pixelValue.toFixed(2);
    
    // Construct table row object as new array so we can merge it with this.identifyArray.
    this.identifyElement = [{
      id: this.tableId,
      name: "Name",
      product: productTitle,
      date: productDate,
      coordinates: clickedCoordinates,
      value: pixelValue
    }];

    // Add table row object to list of all objects with Array.prototype.push.apply() method, so Aurelia can keep track of changes of the array and update the view-model.
    Array.prototype.push.apply(this.identifyArray, this.identifyElement);

    // increment tableId variable
    this.tableId += 1;
  }
}
