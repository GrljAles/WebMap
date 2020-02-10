import {
  MdCollapsible
} from 'aurelia-materialize-bridge';
import {
  inject
} from 'aurelia-framework';
import {
  Map,
  View
} from 'ol';
import TileLayer from 'ol/layer/Tile';
import ImageLayer from 'ol/layer/Image';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import Image from 'ol/source/Image';
import Control from 'ol/control/Control';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle/';
import Draw from 'ol/interaction/Draw/';
import {
  transform
} from 'ol/proj';
import State from 'ol/source/State';
import {
  EventAggregator
} from 'aurelia-event-aggregator';
import * as dataData from 'resources/dataData/dataData.json';
import moment from 'moment';
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import {
  HttpClient
} from 'aurelia-fetch-client';
import {
  AuthService
} from 'aurelia-authentication';
import * as locations from './resources/locations/locations.json';
import {IdentifyTool} from './productTools/identify/identify.js';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';

@inject(EventAggregator, HttpClient, AuthService, IdentifyTool)
export class BaseMap {
  constructor(eventAggregator, httpClient, authService, identifyTool) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.identifyTool = identifyTool;

    this.opacityValue = 1;
    this.layers = dataData.default;
    this.collapsible = MdCollapsible;
    this.activeLayer = 0;
    this.lastidentifyFeatureId = 0;
    this.subscribe();
  }

  setOpacity1(value) {
    this.layers[ii].opacity = value;
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.userNameDisplay = data.userName;
      this.userEmailDsplay = data.email;
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated;
    });
    this.ea.subscribe('identify-button-trigger', (data) => {
      if (data.identifyButon) {
        this.basemap.addInteraction(this.draw);
      }
      else {
        this.basemap.removeInteraction(this.draw);
      }
    });
    this.ea.subscribe('delete-identify-features', (data) => {
      if (data.idsToDelete === -1) {
        for (let feature of this.identifyPointsDrawSource.getFeatures()) {
          this.identifyPointsDrawSource.removeFeature(feature)};
      }
      else {
        this.identifyPointsDrawSource.removeFeature(this.identifyPointsDrawSource.getFeatures()[data.idsToDelete]);
      }
    })
  }

  attached() {
    let _this = this;
    this.opacitySliders = document.getElementsByClassName('opacity-slider');
    for (let ii = 0; ii < this.opacitySliders.length; ii++) {
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
        _this.layers[_this.activeLayer].opacity = values[handle];
        _this.changeOpacity(_this.activeLayer, values[handle]);
      });
    }

    this.dateSliders = document.getElementsByClassName('date-slider')
    for (let ii = 0; ii < this.dateSliders.length; ii++) {
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
        let value = parseInt(values[handle]);
        _this.layers[_this.activeLayer].selectedDateIndex = value;
        _this.changeDisplayedDate(_this.activeLayer, value);
      });
    }

    this.minmaxSliders = document.getElementsByClassName('min-max-slider')
    for (let ii = 0; ii < this.minmaxSliders.length; ii++) {
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
      });

      this.minmaxSliders[ii].noUiSlider.on('end', function(values) {
        let valueMin = parseFloat(values[0]);
        let valueMax = parseFloat(values[1]);
        _this.layers[_this.activeLayer].displaySettings.min = valueMin;
        _this.layers[_this.activeLayer].displaySettings.max = valueMax;
        _this.calculateClassBreaks(_this.activeLayer, valueMin, valueMax);
      });
    }

    this.osmTopo = new TileLayer({
      title: 'osm',
      id: 10000,
      source: new XYZ({
        url: 'http://{a-c}.tile.opentopomap.org/{z}/{x}/{y}.png'
      })
    });
    this.NDVI = new TileLayer({
      title: this.layers[0].name,
      id: this.layers[0].id,
      source: new TileWMS({
        url: 'http://' + locations.backend + locations.mapserver,
        params: {
          'map': locations.maps + 'NDVI.map',
          'LAYERS': 'products',
          'date': '20190715',
          'TILED': true
        },
        projection: 'EPSG:3857'
      }),
      opacity: this.layers[0].opacity
    });

    this.identifyPointsDrawSource = new VectorSource;
    this.identifyPoints = new VectorLayer({
      source: this.identifyPointsDrawSource,
      style: new Style({
        fill: new Fill({
          color: '#4C7261'
        }),
        stroke: new Stroke({
          color: '#4C7261',
          width: 3
        }),
        image: new CircleStyle({
          radius: 3,
          fill: new Fill({
            color: '#212121'
          })
        })
      })
    });

    this.draw = new Draw({
      source: this.identifyPointsDrawSource,
      type: 'Point'
    });

    this.basemap = new Map({
      target: 'basemap',
      layers: [
        this.osmTopo,
        this.NDVI,
        this.identifyPoints
      ],
      view: new View({
        center: transform([14.815333, 46.119944], 'EPSG:4326', 'EPSG:3857'),
        projection: 'EPSG:3857',
        zoom: 8,
        maxZoom: 20
      })
    });

    this.basemap.on('singleclick', function(evt) {
      if (_this.identifyTool.indentifyButtonActive) {
        _this.identifyTool.displayIdentifyResultWindow();
        let viewRes = /** @type {number} */ (_this.basemap.getView().getResolution());
        for (let layer of _this.basemap.getLayers().getArray()) {
          if (layer.get('title') === _this.layers[_this.activeLayer].name) {
            let pixelValueUrl = layer.getSource().getGetFeatureInfoUrl(evt.coordinate, viewRes, 'EPSG:3857', {
              'INFO_FORMAT': 'application/json'
            });
            _this.httpClient.fetch(pixelValueUrl, {
              method: 'GET',
              headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
                'X-Requested-With': 'Fetch'
              },
              mode: 'cors'
            })
              .then(response => response.json())
              .then(data => {
                _this.identifyTool.getPixelValue(_this.lastidentifyFeatureId, data.Value, evt.coordinate, layer.get('title'), _this.layers[_this.activeLayer].displayedDate);
                _this.identifyPointsDrawSource.getFeatures()[_this.identifyPointsDrawSource.getFeatures().length - 1].setId(_this.lastidentifyFeatureId);
                _this.lastidentifyFeatureId += 1;
              });
          }
        }
      } else {};
    });
  }

  collapsibleOpen(idx) {
    idx = parseInt(idx);
    this.layers[idx].active = 1;
    this.changeDisplayedDate(idx, this.layers[idx].selectedDateIndex);
    for (let ii of this.basemap.getLayers().getArray()) {
      if (ii.getProperties().id === idx) {
        ii.setVisible(true);
      }
    }
  }
  collapsibleClose(idx) {
    idx = parseInt(idx);
    this.layers[idx].active = 0;
    for (let ii of this.basemap.getLayers().getArray()) {
      if (ii.getProperties().id === idx) {
        ii.setVisible(false);
      }
    }
  }
  changeDisplayedDate(idx, dateIndex) {
    this.activeLayer = this.layers[idx].id;
    let displayedDate = this.layers[idx].availableDates[(this.layers[idx].availableDates.length - 1) + dateIndex];
    this.layers[idx].displayedDate = moment(displayedDate, 'YYYYMMDD').format('DD.MM.YYYY');
    this.changeLayerDate(idx, [{
      'date': displayedDate
    }]);
    this.calculateClassBreaks(idx, this.layers[idx].displaySettings.min, this.layers[idx].displaySettings.max);
  }
  changeOpacity(id, opacityValue) {
    if (this.basemap) {
      for (let ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === id) {
          ii.setOpacity(opacityValue);
        }
      }
    }
  }
  changeLayerDate(idx, layerDate) {
    if (this.basemap) {
      for (let ii of this.basemap.getLayers().getArray()) {
        if (ii.getProperties().id === idx) {
          let newSource = ii.getSource();
          for (let jj in layerDate) {
            newSource.updateParams(layerDate[jj]);
          }
          newSource.refresh()
        }
      }
    }
  }
  changeLayerRange(idx, classBreaks, classColours) {
    let layerRange = {
      'classBreaks': classBreaks,
      'classColours': classColours
    };
    this.httpClient.fetch('http://' + locations.backend + '/backendapi/changelayerrange', {
      method: 'POST',
      body: JSON.stringify({
        'layerRange': layerRange
      }),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getAccessToken()
      },
      mode: 'cors'
    })
      .then(response => response.json())
      .then(data => {
        this.changeLayerDate(idx, [{
          'map': data.modifiedMapFile
        }, {
          'TIMESTAMP': new Date().getTime()
        }]);
      });
  }


  resetRangeSettings(idx) {
    this.layers[idx].displaySettings.min = this.layers[idx].statistics.min;
    this.layers[idx].displaySettings.max = this.layers[idx].statistics.max;
    this.minmaxSliders[idx].noUiSlider.reset();
    this.calculateClassBreaks(idx, this.layers[idx].displaySettings.min, this.layers[idx].displaySettings.max);
  }

  calculateClassBreaks(idx, min, max) {
    if (this.basemap) {
      let colourRange = this.layers[idx].legend.colours;
      let classRange = this.layers[idx].legend.classBreaks;
      let classBreaks = [];
      let classColours = [];
      for (let ii = 0; ii <= classRange.length - 1; ii++) {
        let currentClass = classRange[ii];
        if (currentClass[0] >= min && currentClass[1] <= max) {
          classBreaks.push(currentClass);
          classColours.push(colourRange[ii]);
        }
      }
      this.calculateLegend(idx, classBreaks, classColours);
      this.changeLayerRange(idx, classBreaks, classColours);
    }
  }

  calculateLegend(idx, classBreaks, classColours) {
    if (this.basemap) {
      if (document.getElementById('legend-colours-wraper' + idx)) {
        document.getElementById('legend-colours-wraper' + idx).parentElement.removeChild(document.getElementById('legend-colours-wraper' + idx));
      }
      let legendColoursWraper = document.createElement('div');
      legendColoursWraper.id = 'legend-colours-wraper' + idx;
      legendColoursWraper.classList.add('legend-image');
      let colourBoxWidth = ((document.getElementById('min-max-slider' + idx).offsetWidth / (this.layers[idx].displaySettings.nClasses)) * 100) / (document.getElementById('min-max-slider' + idx).offsetWidth);
      for (let ii = classBreaks.length - 1; ii >= 1; ii--) {
        let colourBox = document.createElement('p');
        colourBox.classList.add('colour-box');
        if (this.layers[idx].legend.type === 'continous') {
          let colour1 = 'rgb(' + classColours[ii][1].join() + ')';
          let colour2 = 'rgb(' + classColours[ii][0].join() + ')';
          colourBox.setAttribute('style', 'background: linear-gradient(to right, ' + colour2 + ' 0%, ' + colour1 + ' 100%); width: ' + colourBoxWidth + '%; height: 5px');
        } else {
          let colour1 = 'rgb(' + classColours[ii][0].join() + ')';
          colourBox.setAttribute('style', 'background: ' + colour1 + '; width: ' + colourBoxWidth + '%;' + 'height: 5px');
        }
        legendColoursWraper.appendChild(colourBox);
      }
      let lhId = 'legend-holder' + idx;
      document.getElementById(lhId).appendChild(legendColoursWraper);
    }
  }
}
