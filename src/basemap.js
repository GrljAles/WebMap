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
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider'
import 'materialize-css/extras/noUiSlider/nouislider.css'

@inject(EventAggregator)
export class BaseMap {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.userNameDisplay = null;
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
    for (var ii in this.layers) {
      var opacitySlider = document.getElementById('opacity-slider'+this.layers[ii].id);
        noUiSlider.create(opacitySlider, {
        start: [this.layers[ii].opacity],
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [0],
          'max': [1]
        },
        connect: 'lower'
      });

      opacitySlider.noUiSlider.on('update', function (values, handle) {
        _this.layers[_this.activeLayer].opacity = values[handle]
        _this.changeOpacity(_this.activeLayer, values[handle])
      });

      var dateSlider = document.getElementById('date-slider'+this.layers[ii].id);
        noUiSlider.create(dateSlider, {
        start: [0],
        step: 1,
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [(this.layers[ii].availableDates.length - 1) * -1],
          'max': [0]
        },
        connect: 'upper'
      });

      dateSlider.noUiSlider.on('update', function (values, handle) {
        let value = parseInt(values[handle])
        _this.layers[_this.activeLayer].selectedDateIndex = value
        _this.changDisplayedDate(_this.activeLayer, value)
      });

      var minmaxSlider = document.getElementById('min-max-slider'+this.layers[ii].id);
        noUiSlider.create(minmaxSlider, {
        start: [this.layers[ii].statistics.min, this.layers[ii].statistics.max],
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [this.layers[ii].statistics.min],
          'max': [this.layers[ii].statistics.max]
        },
        connect: true,
        behaviour: 'drag-tap'
      });

      minmaxSlider.noUiSlider.on('update', function (values, handle) {
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
      source: new TileWMS({
        url: 'https://tiles.maps.eox.at/wms?',
        attributions: '© <a href="Sentinel-2 cloudless – https://s2maps.eu by EOX IT Services GmbH (Contains modified Copernicus Sentinel data 2016 & 2017)</a>',
        params: {
          'LAYERS': 's2cloudless_3857'
        }
      })
    }),
    this.NDVI = new TileLayer({
      title: this.layers[0].name,
      id: this.layers[0].id,
      source: new TileWMS({
        url: 'http://84.255.193.232/map/mapserv?',
        params: {
          'map':"/usr/lib/cgi-bin/NDVI.map",
          'LAYERS':"products",
          'date': "20190615"
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
  changDisplayedDate(idx, dateIndex){
    this.activeLayer = this.layers[idx].id;
    let displayedDate = this.layers[idx].availableDates[(this.layers[idx].availableDates.length -1) + dateIndex]
    this.layers[idx].displayedDate = moment(displayedDate, 'YYYYMMDD').format('DD.MM.YYYY')
    this.changeLayerDate(idx, displayedDate)
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
          newSource.updateParams({
              'date': layerDate
            });
          ii.setSource(newSource)
        }
      }
    }
  }
  calculateClassBreaks(idx, min, max){
    if (this.basemap){
      let nClasses = this.layers[idx].displaySettings.nClasses;
      let classRange = (max - min) / nClasses;
      let classBreaks = [min];
      for (let ii = 0; ii < nClasses; ii++) {
        min += classRange;
        classBreaks.push(min)
      }
      console.log(classBreaks)
    }
  }
/*   calculateLegend(idx, classBreaks) {
    let legenWraper = document.getElementById('legend' + idx);
    if (legenWraper) {
      legenWraper.parentNode.removeChild(legendContainer);
    };
    let breaks = this.productList[a].classBreaks[timeselection];
    let colours = this.productList[a].classBreaks.colour;
    let breaksLen = this.objectSize(breaks);
    let colourBoxWidth = 100 / breaksLen;
    let legend = document.createElement('div');
    legend.id = 'legendados' + a;
    legend.classList.add('legend-image');
    for (let i = breaksLen; i >= 1; i--) {
      let colourBox = document.createElement('div');
      colourBox.classList.add('colour-box');
      if (this.objectSize(colours['c' + i]) === 2) {
        var colour1 = 'rgb(' + colours['c' + i].b1.r + ', ' + colours['c' + i].b1.g + ', ' + colours['c' + i].b1.b + ')';
        let colour2 = 'rgb(' + colours['c' + i].b2.r + ', ' + colours['c' + i].b2.g + ', ' + colours['c' + i].b2.b + ')';
        colourBox.setAttribute('style', 'background: linear-gradient(to right, ' + colour1 + ' 0%, ' + colour2 + ' 100%); width: ' + colourBoxWidth + '%');
      } else {
        var colour1 = 'rgb(' + colours['c' + i].b1.r + ', ' + colours['c' + i].b1.g + ', ' + colours['c' + i].b1.b + ')';
        colourBox.setAttribute('style', 'background: ' + colour1 + '; width: ' + colourBoxWidth + '%');
      }
      colourBox.innerText = breaks['b' + i];
      legend.appendChild(colourBox);
    }
    let lhId = 'legend-holder' + a;
    document.getElementById(lhId).appendChild(legend);
  } 
  }*/
}
