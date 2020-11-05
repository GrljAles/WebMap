import {MdCollapsible} from 'aurelia-materialize-bridge';
import {inject} from 'aurelia-framework';
import {Map, View} from 'ol';
import TileLayer from 'ol/layer/Tile';
import XYZ from 'ol/source/XYZ';
import TileWMS from 'ol/source/TileWMS';
import Fill from 'ol/style/Fill';
import Stroke from 'ol/style/Stroke';
import CircleStyle from 'ol/style/Circle/';
import {
  transform
} from 'ol/proj';
import {
  EventAggregator
} from 'aurelia-event-aggregator';
import * as dataData from 'resources/dataData/dataData.json';
import moment from 'moment';
import noUiSlider from 'materialize-css/extras/noUiSlider/noUiSlider';
import 'materialize-css/extras/noUiSlider/nouislider.css';
import {HttpClient} from 'aurelia-fetch-client';
import {AuthService} from 'aurelia-authentication';
import * as locations from './resources/locations/locations.json';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import Style from 'ol/style/Style';
import GeoJSON from 'ol/format/GeoJSON';
import {Draw} from 'ol/interaction';
import {getArea, getLength} from 'ol/sphere';
import {observable} from 'aurelia-framework';
import {ChartEl} from './productTools/tsChart/chart-el.js';

@inject(EventAggregator, HttpClient, AuthService, ChartEl)
@observable('activeLayer')
@observable('buttonCheck')

export class BaseMap {  
  constructor(eventAggregator, httpClient, authService, chartEl) {
    this.ea = eventAggregator;
    this.httpClient = httpClient;
    this.authService = authService;
    this.chartel = chartEl;
    this.opacityValue = 1;
    this.layers = dataData.default;
    this.collapsible = MdCollapsible;
    this.activeLayer = 0;
    this.lastidentifyFeatureId = 0;
    this.drawGeomType = 'Point';
    this.tsChartWindow = false;
    this.toolNotification = false;
    this.toolPreloader = false;
    this.layerDescription = false;

    this.buttonCheck = {
      refresh: {
        state: true,
        drawGeom: null,
        relatedLayer: null
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
        relatedLayer: 'profileLines'
      }
    };
    this.subscribe();
    this.fetchProductData();

  }
  // Observables observe variable (in method name before 'Chnaged' part) and fire function on change.
  activeLayerChanged(newValue, oldValue) {
    this.ea.publish('activeLayerChanged', newValue)
  }
  buttonCheckChanged(newValue, oldValue) {
    this.ea.publish('buttonCheckChanged', newValue)
  }

  setOpacity1(value) {
    this.layers[ii].opacity = value;
  }

  getUrl(name) {
    return require(`./resources/icons/${name}.svg`);
  }

  fetchProductData() {
    this.httpClient.fetch('http://' + locations.backend + '/backendapi/getproductdates', {
      method: 'GET',
      headers: {
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getAccessToken()
      },
      mode: 'cors'
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        this.productData = JSON.parse(data);
        for (let prID in this.productData.cargo) {
          let productName = this.productData.cargo[prID].productName;
          let availableDates = this.productData.cargo[prID].availableDates;
          for (let layID in this.layers) {
            if (this.layers[layID].name === productName) {
              // Updates the layers object.
              this.layers[layID].availableDates = availableDates;
              // Updates the noui layers range.
              this.dateSliders[layID].noUiSlider.updateOptions({
                range: {
                  'min': [(this.layers[layID].availableDates.length - 1) * -1],
                  'max': [0]
                }
              });
            }
          }
        }
      })
      .catch(error => {
        this.ea.publish('open-tool-notification', {
          errorWindow: true,
          errorMessage: 'genericBackend'
        });
      });
  }

  subscribe() {
    this.ea.subscribe('user-data-update', (data) => {
      this.userNameDisplay = data.userName;
      this.userEmailDsplay = data.email;
    });
    this.ea.subscribe('authentication-change', authenticated => {
      this.authenticated = authenticated;
    });

    this.ea.subscribe('delete-tool-features', (data) => {
      this.deleteToolFeatures(data);
    });
    this.ea.subscribe('give-me-geojson', whichLayer => {
      this.saveIdentifyGeojson(whichLayer);
    });
    this.ea.subscribe('get-ts-table', whichLayer => {
      this.tsPointFeatureCount = 0;
    });
    this.ea.subscribe('ts-chart-window-changed', data => {
      this.tsChartWindow = data;
    });
    this.ea.subscribe('open-tool-notification', notificationStatus => {
      this.toolNotification = notificationStatus.errorWindow;
    });
    this.ea.subscribe('close-tool-notification', notificationStatus => {
      this.toolNotification = notificationStatus;
    });
    this.ea.subscribe('open-tool-preloader', preloaderStatus => {
      this.toolPreloader = preloaderStatus.preloaderWindow;
    });
    this.ea.subscribe('close-tool-preloader', preloaderStatus => {
      this.toolPreloader = preloaderStatus.preloaderWindow;
    });
    this.ea.subscribe('get-ts-poly-json', data => {
      this.publishToolJson(data);
    });
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

      this.opacitySliders[ii].noUiSlider.on('update', function(values, handle) {
        _this.layers[_this.activeLayer].opacity = values[handle];
        _this.changeOpacity(_this.activeLayer, values[handle]);
      });
    }

    this.dateSliders = document.getElementsByClassName('date-slider');
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
      this.dateSliders[ii].noUiSlider.on('update', function(values, handle) {
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

    this.toolLayerStyle = new Style({
      fill: new Fill({
        color: 'rgba(0, 0, 0, 0.25)'
      }),
      stroke: new Stroke({
        color: 'rgba(0, 0, 0, 1)',
        width: 3
      }),
      image: new CircleStyle({
        radius: 3,
        stroke: new Stroke({
          color: 'rgba(0, 0, 0, 1',
          width: 2
        })
      })
    });

    this.identifyPointsDrawSource = new VectorSource;
    this.identifyPoints = new VectorLayer({
      title: 'identifyPoints',
      source: this.identifyPointsDrawSource,
      style: this.toolLayerStyle
    });

    this.zonalStatsPolysDrawSource = new VectorSource;
    this.zonalStatsPolys = new VectorLayer({
      title: 'zonalStatsPolygons',
      source: this.zonalStatsPolysDrawSource,
      style: this.toolLayerStyle
    });

    this.tsChartPointsDrawSource = new VectorSource;
    this.tsChartPoints = new VectorLayer({
      title: 'tsPoints',
      source: this.tsChartPointsDrawSource,
      style: this.toolLayerStyle
    });
    this.tsChartPolygonsDrawSource = new VectorSource;
    this.tsChartPolygons = new VectorLayer({
      title: 'zonalTSPolygons',
      source: this.tsChartPolygonsDrawSource,
      style: this.toolLayerStyle
    });
    this.profileLinesDrawSource = new VectorSource;
    this.profileLines = new VectorLayer({
      title: 'profileLines',
      source: this.profileLinesDrawSource,
      style: this.toolLayerStyle
    });

    this.draw = new Draw({
      source: null,
      type: null
    });

    this.basemap = new Map({
      target: 'basemap',
      layers: [
        this.osmTopo,
        this.NDVI,
        this.identifyPoints,
        this.zonalStatsPolys,
        this.tsChartPoints,
        this.tsChartPolygons,
        this.profileLines
      ],
      view: new View({
        center: transform([14.815333, 46.119944], 'EPSG:4326', 'EPSG:3857'),
        projection: 'EPSG:3857',
        zoom: 8,
        maxZoom: 20
      })
    });

    this.zonalStatsPolysDrawSource.on('addfeature', function(evt) {
      if (_this.buttonCheck.zonalStat.state) {
        let zonalStatsParams = {
          "product": _this.layers[_this.activeLayer].name,
          "dates": _this.dateToYYYYMMDD(_this.layers[_this.activeLayer].displayedDate)
        };
        zonalStatsParams["zone"] = _this.featuresToGeoJSON(evt.feature);
        _this.zonalStatistcsRequest(zonalStatsParams);
      }
    });
    
    this.tsChartPointsDrawSource.on('addfeature', function(evt) {
      if (_this.buttonCheck.tsChart.state) {
        if (_this.tsChartPointsDrawSource.getFeatures().length < 11) {
          let lastPointCoordinates = evt.feature.getGeometry().getCoordinates();
          let tsPointData = {
            product: _this.layers[_this.activeLayer].name,
            x: Math.round((lastPointCoordinates[0] + Number.EPSILON) * 10000) / 10000,
            y: Math.round((lastPointCoordinates[1] + Number.EPSILON) * 10000) / 10000
          };
          _this.setIdentifyLayerProperties('tsPoints', tsPointData);
        }
        else {
          _this.tsChartPointsDrawSource.removeFeature(evt.feature);
          if (!_this.toolNotification) {
            _this.ea.publish('open-tool-notification', {
              errorWindow: true,
              errorMessage: 'featureLimitPerRequest'
            });
          }
        }
      }
    });

    this.tsChartPolygonsDrawSource.on('addfeature', function(evt) {
      if (_this.buttonCheck.zonalTSChart.state) {
        if (_this.tsChartPolygonsDrawSource.getFeatures().length < 2) {
          let lastPolygonArea = getArea(evt.feature.getGeometry());
          if (lastPolygonArea < 1000000) {
            let tsPolygonData = {
              product: _this.layers[_this.activeLayer].name,
              area: _this.formatArea(lastPolygonArea)
            };
            _this.setIdentifyLayerProperties('zonalTSPolygons', tsPolygonData);
          }
          else {
            _this.tsChartPolygonsDrawSource.removeFeature(evt.feature);
            if (!_this.toolNotification) {
              _this.ea.publish('open-tool-notification', {
                errorWindow: true,
                errorMessage: 'polygonAreaTooLarge'
              });
            }
          }
        }
        else {
          _this.tsChartPolygonsDrawSource.removeFeature(evt.feature);
          if (!_this.toolNotification) {
            _this.ea.publish('open-tool-notification', {
              errorWindow: true,
              errorMessage: 'featureLimitPerRequestZonalTS'
            });
          }
        }
      }
    });

    this.basemap.on('singleclick', function(evt) {
      if (_this.buttonCheck.identify.state) {
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
              .then(response => {
                return response.text();
              })
              .then(data => {
                let aaa = JSON.parse(data);
                _this.setIdentifyLayerProperties('identifyPoints', {
                  product: layer.get('title'),
                  date: _this.layers[_this.activeLayer].displayedDate,
                  value: aaa.Value
                });
              })
              .catch(error => {
                _this.setIdentifyLayerProperties('identifyPoints', {
                  product: layer.get('title'),
                  date: _this.layers[_this.activeLayer].displayedDate,
                  value: 'noData'
                });
              });
          }
        }
      }
    });

    this.profileLinesDrawSource.on('addfeature', function(evt) {
      if (_this.buttonCheck.profile.state) {
        let lastLineLength = getLength(evt.feature.getGeometry());
        let profileLineData = {
          product: _this.layers[_this.activeLayer].name,
          dates: _this.dateToYYYYMMDD(_this.layers[_this.activeLayer].displayedDate),
          length: _this.formatLength(lastLineLength)
        };
        _this.setIdentifyLayerProperties('profileLines', profileLineData);
        profileLineData.resolution = _this.layers[_this.activeLayer].dataProperties.resolution;
        profileLineData.p0 = evt.feature.getGeometry().getCoordinates()[0];
        profileLineData.p1 = evt.feature.getGeometry().getCoordinates()[1];
        _this.profileChartRequest(profileLineData);
      }
    });
  }

  toggleLayerDescription(layer) {
    if (this.layerDescription === true) {
      this.layerDescription = false;
    }
    else {
      this.layerDescription = true;
    }
  }
  formatArea(area) {
    let output;
    if (area > 10000) {
      output = (Math.round(area / 1000000 * 100) / 100) +
          ' ' + 'km<sup>2</sup>';
    } else {
      output = (Math.round(area * 100) / 100) +
          ' ' + 'm<sup>2</sup>';
    }
    return output;
  }

  formatLength(length) {
    let output;
    if (length > 1000) {
      output = (Math.round(length / 1000 * 100) / 100) +
          ' ' + 'km';
    } else {
      output = (Math.round(length * 100) / 100) +
          ' ' + 'm';
    }
    return output;
  }

  dateToYYYYMMDD(dateString) {
    let yyyy = dateString.split('.')[2];
    let mm = dateString.split('.')[1];
    let dd = dateString.split('.')[0];
    return yyyy + mm + dd;
  }

  YYYYMMDDToDate(dateString) {
    let yyyy = dateString.slice(0, 4);
    let mm = dateString.slice(4, 6);
    let dd = dateString.slice(6, 8);
    return dd + '.' + mm + '.' + yyyy;
  }

  featuresToGeoJSON(features) {
    let tmpPolyDrawSource = new VectorSource;
    tmpPolyDrawSource.addFeature(features);
    let writer = new GeoJSON();
    let geojsonStr = writer.writeFeatures(tmpPolyDrawSource.getFeatures())
    tmpPolyDrawSource = null;
    return geojsonStr;
  }

  zonalStatistcsRequest(zonalStatsParams) {
    this.ea.publish('open-tool-preloader', {
      preloaderWindow: true,
      toolPreloaderMessage: 'zonalStatistics'
    });
    this.httpClient.fetch('http://' + locations.backend + '/backendapi/zonalstatistics', {
      method: 'POST',
      body: JSON.stringify(zonalStatsParams),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getAccessToken()
      },
      mode: 'cors'
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        let zonalData = JSON.parse(data);
        zonalData.date = this.YYYYMMDDToDate(zonalData.date);
        this.setIdentifyLayerProperties('zonalStatsPolygons', zonalData);
        this.ea.publish('close-tool-preloader', {
          preloaderWindow: false
        });
      })
      .catch(error => {
        this.ea.publish('close-tool-preloader', {
          preloaderWindow: false
        });
        this.ea.publish('open-tool-notification', {
          errorWindow: true,
          errorMessage: 'genericBackend'
        });
      });
  }

  profileChartRequest(profileLineData) {
    this.chartel.destroyChart();
    this.ea.publish('open-tool-preloader', {
      preloaderWindow: true,
      toolPreloaderMessage: 'profileLine'
    });
    let datas = {
      data: {},
      legendDisplay: false,
      xAxisType: 'linear',
      xAxisUnit: null
    };
    this.ea.publish('ts-chart-window-changed', true);
    this.httpClient.fetch('http://' + locations.backend + '/backendapi/profilechart', {
      method: 'POST',
      body: JSON.stringify(profileLineData),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch',
        'Authorization': 'Bearer ' + this.authService.getAccessToken()
      },
      mode: 'cors'
    })
      .then(response => {
        return response.text();
      })
      .then(data => {
        let profileChart = JSON.parse(data);
        datas.data = profileChart;
        this.chartel.updateChart(datas);
        this.ea.publish('close-tool-preloader', {
          preloaderWindow: false
        });
      })
      .catch(error => {
        this.ea.publish('close-tool-preloader', {
          preloaderWindow: false
        });
        this.ea.publish('open-tool-notification', {
          errorWindow: true,
          errorMessage: 'genericBackend'
        });
      });
  }

  setIdentifyLayerProperties(whichLayer, propJson) {
    this.chartel.destroyChart();
    for (let selectedLayer of this.basemap.getLayers().getArray()) {
      if (selectedLayer.get('title') === whichLayer) {
        let selectedLayerSource = selectedLayer.getSource();
        let lastFeature = selectedLayerSource.getFeatures()[selectedLayerSource.getFeatures().length - 1];
        lastFeature.setProperties(propJson);
        lastFeature.setId(this.lastidentifyFeatureId);
        let nPropJson = Object.assign({id: this.lastidentifyFeatureId}, propJson);

        this.ea.publish('add-table-row', {
          layer: whichLayer,
          row: nPropJson
        });
        this.lastidentifyFeatureId += 1;
      }
    }
  }

  deleteToolFeatures(deleteWhat) {
    for (let selectedLayer of this.basemap.getLayers().getArray()) {
      if (selectedLayer.get('title') === deleteWhat.layer) {
        let selectedLayerSource = selectedLayer.getSource();
        if (deleteWhat.idsToDelete === 'all') {
          for (let feature of selectedLayerSource.getFeatures()) {
            selectedLayerSource.removeFeature(feature);
          }
          this.lastidentifyFeatureId = 0;
        } else {
          selectedLayerSource.removeFeature(selectedLayerSource.getFeatures()[deleteWhat.idsToDelete]);
        }
      }
    }
  }

  saveIdentifyGeojson(whichLayer) {
    let writer = new GeoJSON();
    for (let selectedLayer of this.basemap.getLayers().getArray()) {
      if (selectedLayer.get('title') === whichLayer) {
        let selectedLayerSource = selectedLayer.getSource();
        let geojsonStr = writer.writeFeatures(selectedLayerSource.getFeatures());
        this.ea.publish('this-is-selected-table-geojson', geojsonStr)
      }
    }
  }

  publishToolJson(data) {
    let writer = new GeoJSON();
    if (data === 'zonalTSPolygons') {
      let geojsonStr = writer.writeFeatures(this.tsChartPolygonsDrawSource.getFeatures());
      this.ea.publish('this-is-zonalTSPolygons-table', geojsonStr);
    }
  }

  toggleTool(buttonId) {
    for (let i in this.buttonCheck) {
      if (i !== buttonId) {
        this.buttonCheck[i].state = false;
      }
      else {
        this.buttonCheck[buttonId].state = !this.buttonCheck[buttonId].state;
        this.toggleDrawInteraction(this.buttonCheck[buttonId]);
        this.ea.publish('activeTableChanged', this.buttonCheck[buttonId].relatedLayer);
      }
    }
    this.chartCheck(buttonId);
    this.chartel.destroyChart();
  }

  chartCheck(buttonId) {
    if (buttonId === 'tsChart' && this.buttonCheck['tsChart'].state === true || buttonId === 'zonalTSChart'  && this.buttonCheck['zonalTSChart'].state === true || buttonId === 'profile' && this.buttonCheck['profile'].state === true ) {
      this.tsChartWindow = true;
    }
    else {
      this.tsChartWindow = false;
    }
  }
  toggleDrawInteraction(buttonProps) {
    let maxPoints = 10000000000;
    if (buttonProps.state) {
      this.basemap.removeInteraction(this.draw);
      for (let selectedLayer of this.basemap.getLayers().getArray()) {
        if (selectedLayer.get('title') === buttonProps.relatedLayer) {
          if (selectedLayer.get('title') === 'profileLines') {
            maxPoints = 2;
          }
          else {
            maxPoints = 10000000000;
          }
          let selectedLayerSource = selectedLayer.getSource();
          this.draw = new Draw({
            source: selectedLayerSource,
            type: buttonProps.drawGeom,
            maxPoints: maxPoints
          });
          this.basemap.addInteraction(this.draw);
        }
      }
    }
    else {
      this.basemap.removeInteraction(this.draw);
    }
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
          newSource.refresh();
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
      let legendClassBreaks = [];
      let classColours = [];
      for (let ii = 0; ii <= classRange.length - 1; ii++) {
        let currentClass = classRange[ii];
        if (currentClass[0] >= min && currentClass[1] <= max) {
          classBreaks.push(currentClass);
          legendClassBreaks.push(currentClass);
          classColours.push(colourRange[ii]);
        }
        else {
          legendClassBreaks.push([]);
        }
      }
      this.calculateLegend(idx, legendClassBreaks);
      this.changeLayerRange(idx, classBreaks, classColours);
    }
  }

  calculateLegend(idx, classBreaks) {
    if (this.basemap) {
      if (document.getElementById('legend-colours-wraper' + idx)) {
        document.getElementById('legend-colours-wraper' + idx).parentElement.removeChild(document.getElementById('legend-colours-wraper' + idx));
      }
      let legendColoursWraper = document.createElement('div');
      legendColoursWraper.id = 'legend-colours-wraper' + idx;
      legendColoursWraper.classList.add('legend-image');
      let colourBoxWidth = ((document.getElementById('min-max-slider' + idx).offsetWidth / (this.layers[idx].displaySettings.nClasses)) * 100) / (document.getElementById('min-max-slider' + idx).offsetWidth);

      for (let ii = 0; ii < this.layers[idx].legend.classBreaks.length; ii++) {
        let colourBox = document.createElement('span');
        colourBox.setAttribute('id', 'cb-span-' + ii);
        colourBox.classList.add('colour-box');
        if (this.layers[idx].legend.type === 'continous') {
          if (this.layers[idx].legend.classBreaks[ii] === classBreaks[ii]) {
            let colour1 = 'rgb(' + this.layers[idx].legend.colours[ii][1].join() + ')';
            let colour2 = 'rgb(' + this.layers[idx].legend.colours[ii][0].join() + ')';
            colourBox.setAttribute('style', 'background: linear-gradient(to right, ' + colour2 + ' 0%, ' + colour1 + ' 100%); width: ' + colourBoxWidth + '%; height: 15px');
          }
          else {
            let colour1 = 'rgb(124, 179, 66)';
            let colour2 = 'rgb(124, 179, 66)';
            colourBox.setAttribute('style', 'background: linear-gradient(to right, ' + colour2 + ' 0%, ' + colour1 + ' 100%); width: ' + colourBoxWidth + '%; height: 15px');
          }
        }
        else {
          if (this.layers[idx].legend.classBreaks[ii] === classBreaks[ii]) {
            let colour1 = 'rgb(' + this.layers[idx].legend.colours[ii][1].join() + ')';
            colourBox.setAttribute('style', 'background: ' + colour1 + '; width: ' + colourBoxWidth + '%;' + 'height: 15px');
          }
          else {
            let colour1 = 'rgb(124, 179, 66)';
            colourBox.setAttribute('style', 'background: ' + colour1 + '; width: ' + colourBoxWidth + '%;' + 'height: 15px');
          }
        }
        legendColoursWraper.appendChild(colourBox);
      }
      let lhId = 'legend-holder' + idx;
      document.getElementById(lhId).appendChild(legendColoursWraper);
    }
  }
}
