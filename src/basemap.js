import { MdCollapsible } from "aurelia-materialize-bridge";
import {inject} from 'aurelia-framework';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import Image from 'ol/source/Image';
import Control from 'ol/control/Control';
import {transform} from 'ol/proj';
import State from 'ol/source/State';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as dataData from 'resources/dataData/dataData.json';
import moment from 'moment';
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import * as locations from "./resources/locations/locations.json";

@inject(EventAggregator)
export class BaseMap {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.opacityValue = 1;
    this.layers = dataData.default;
    this.collapsible = MdCollapsible;
    this.activeLayer = 0;
    this.subscribe();
  }
  setOpacity1(value) {
    this.layers[ii].opacity = value
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
    var _this = this
    this.opacitySliders = document.getElementsByClassName('opacity-slider')
    for (var ii = 0; ii < this.opacitySliders.length; ii++) {
      noUiSlider.create(this.opacitySliders[ii], {
        start: [this.layers[ii].opacity],
        orientation: 'horizontal',
        range: {
          'min': [0],
          'max': [1]
        },
        connect: 'lower'
      });

      this.opacitySliders[ii].noUiSlider.on('update', function (values, handle) {
        _this.layers[_this.activeLayer].opacity = values[handle]
        _this.changeOpacity(_this.activeLayer, values[handle])
      });
    }

    this.dateSliders = document.getElementsByClassName('date-slider')
    for (var ii = 0; ii < this.dateSliders.length; ii++) {
      noUiSlider.create(this.dateSliders[ii], {
        start: [0],
        step: 1,
        orientation: 'horizontal',
        range: {
          'min': [(this.layers[ii].availableDates.length - 1) * -1],
          'max': [0]
        },
        connect: 'upper'
      });

      this.dateSliders[ii].noUiSlider.on('update', function (values, handle) {
        let value = parseInt(values[handle])
        _this.layers[_this.activeLayer].selectedDateIndex = value
        _this.changeDisplayedDate(_this.activeLayer, value)
      });
    }

    this.minmaxSliders = document.getElementsByClassName('min-max-slider')
    for (var ii = 0; ii < this.minmaxSliders.length; ii++) {
      noUiSlider.create(this.minmaxSliders[ii], {
        start: [this.layers[ii].displaySettings.min, this.layers[ii].displaySettings.max],
        orientation: 'horizontal',
        tooltips: [true, true],
        range: {
          'min': [this.layers[ii].statistics.min],
          'max': [this.layers[ii].statistics.max]
        },
        pips: {
          mode: 'range',
          density: 40
        },
        connect: true,
        behaviour: 'drag-tap'
      })

      this.minmaxSliders[ii].noUiSlider.on('end', function (values) {
        let valueMin = parseFloat(values[0]);
        let valueMax = parseFloat(values[1]);
        _this.layers[_this.activeLayer].displaySettings.min = valueMin
        _this.layers[_this.activeLayer].displaySettings.max = valueMax
        _this.calculateClassBreaks(_this.activeLayer, valueMin, valueMax)
      });
    }

    this.osmTopo = new TileLayer({
      title: 'osm',
      id: 10000,
      source: new XYZ({
        url: 'https://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
      })
    }),
    this.NDVI = new TileLayer({
      title: this.layers[0].name,
      id: this.layers[0].id,
      source: new TileWMS({
        url: 'http://' + locations.backend + locations.mapserver,
        params: {
          'map': locations.maps + "NDVITest.map",
          'LAYERS':"products",
          'date': "20190625"
      },
        projection: 'EPSG:3857',
      }),
      opacity: this.layers[0].opacity,
    })

    this.basemap = new Map({
      target: 'basemap',
      layers: [
        this.osmTopo,
        this.NDVI
      ],
      view: new View({
        center: transform([16, 45.448224], 'EPSG:4326', 'EPSG:3857'),
        projection: 'EPSG:3857',
        zoom: 8,
        maxZoom: 20
      }),
    });
  }
  collapsibleOpen(idx) {
    idx = parseInt(idx)
    this.layers[idx].active = 1;
      this.changeDisplayedDate(idx, this.layers[idx].selectedDateIndex)
      for (var ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === idx) {
          ii.setVisible(true)
        }
      }
  }
  collapsibleClose(idx) {
    idx = parseInt(idx)
    this.layers[idx].active = 0;
      for (var ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === idx) {
          ii.setVisible(false)
        }
      }
  }
  changeDisplayedDate(idx, dateIndex){
    this.activeLayer = this.layers[idx].id;
    let displayedDate = this.layers[idx].availableDates[(this.layers[idx].availableDates.length -1) + dateIndex]
    this.layers[idx].displayedDate = moment(displayedDate, 'YYYYMMDD').format('DD.MM.YYYY')
    this.changeLayerDate(idx, [{'date': displayedDate}])
    this.calculateClassBreaks(idx, this.layers[idx].displaySettings.min, this.layers[idx].displaySettings.max)
  }
  changeOpacity(id, opacityValue) {
    if (this.basemap){
      for (var ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === id) {
          ii.setOpacity(opacityValue)
        }
      }
    }
  }  
  changeLayerDate(idx, layerDate) {
    if (this.basemap){
      for (var ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === idx) {
          let newSource = ii.getSource()
          for (let jj in layerDate) {
            newSource.updateParams(layerDate[jj])
          }
          ii.setSource(newSource)

        }
      }
    }
  }
  changeLayerRange(idx, classBreaks) {
    let breaks = {};
    let colours = {}
    for (let ii = 0; ii < classBreaks.length; ii++) {
      breaks['b'+ii] = classBreaks[ii];
      colours['c'+ii] = this.layers[idx].legend.colours[ii].join(' ');
    }
    this.changeLayerDate(idx, [breaks, colours])
  }
  resetRangeSettings(idx) {
    this.layers[idx].displaySettings.min = this.layers[idx].statistics.min;
    this.layers[idx].displaySettings.max = this.layers[idx].statistics.max;
    this.minmaxSliders[idx].noUiSlider.reset();
    this.calculateClassBreaks(idx, this.layers[idx].displaySettings.min, this.layers[idx].displaySettings.max);
  }
  calculateClassBreaks(idx, min, max){
    if (this.basemap){
      let nClasses = this.layers[idx].displaySettings.nClasses;
      let classRange = (max - min) / nClasses;
      let classBreaks = [min.toFixed(2)];
      for (let ii = 0; ii < nClasses; ii++) {
        min += classRange;
        classBreaks.push(min.toFixed(2))
      }
      this.calculateLegend(idx)
      this.changeLayerRange(idx, classBreaks)
    }
  }
   calculateLegend(idx) {
    if (this.basemap){
      if (document.getElementById('legend-colours-wraper' + idx)) {
        document.getElementById('legend-colours-wraper' + idx).parentElement.removeChild(document.getElementById('legend-colours-wraper' + idx))
      };
      let legendColoursWraper = document.createElement('div');
      legendColoursWraper.id = 'legend-colours-wraper' + idx;
      legendColoursWraper.classList.add('legend-image');
      let colourBoxWidth = ((document.getElementById('min-max-slider' + idx).offsetWidth / this.layers[idx].displaySettings.nClasses) * 100) / (document.getElementById('min-max-slider' + idx).offsetWidth);
      for (let ii = this.layers[idx].displaySettings.nClasses; ii >= 1; ii--) {
        let colourBox = document.createElement('p');
        colourBox.classList.add('colour-box');
        if (this.layers[idx].legend.type === 'continous') {
          let colour1 = 'rgb(' + this.layers[idx].legend.colours[ii].join() + ')';
          let colour2 = 'rgb(' + this.layers[idx].legend.colours[ii-1].join() + ')';
          colourBox.setAttribute('style', 'background: linear-gradient(to right, ' + colour2 + ' 0%, ' + colour1 + ' 100%); width: ' + colourBoxWidth + '%; height: 5px');
        } else {
          var colour1 = 'rgb(' + this.layers[idx].legend.colours[ii].join() + ')';
          colourBox.setAttribute('style', 'background: ' + colour1 + '; width: ' + colourBoxWidth + '%;' + 'height: 5px');
        }
        legendColoursWraper.appendChild(colourBox);
      }
      let lhId = 'legend-holder' + idx;
      document.getElementById(lhId).appendChild(legendColoursWraper);
    }
  }
}
