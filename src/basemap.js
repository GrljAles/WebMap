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
    for (var ii in this.layers) {
      var opacitySlider = document.getElementById('opacity-slider'+this.layers[ii].id);
        noUiSlider.create(opacitySlider, {
        start: [this.layers[ii].opacity],
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [0],
          'max': [1]
        }
      });
      var adsa = document.getElementById('opacityValue'+this.layers[ii].id);

      var _this = this
      opacitySlider.noUiSlider.on('update', function (values, handle) {
        var opacity = values[handle]
        adsa.innerHTML = values[handle]
        function chop() {
          _this.layers[ii].opacity = opacity
        }
        chop()
      });

      //this.layers[ii].opacity = opacitySlider.opacity

      var dateSlider = document.getElementById('date-slider'+this.layers[ii].id);
        noUiSlider.create(dateSlider, {
        start: [1],
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [0],
          'max': [1]
        }
      });
      var minmaxSlider = document.getElementById('min-max-slider'+this.layers[ii].id);
        noUiSlider.create(minmaxSlider, {
        start: [1],
        orientation: 'horizontal', // 'horizontal' or 'vertical'
        range: {
          'min': [0],
          'max': [1]
        }
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
  changDisplayedDate(e, id, dateIndex){
    let displayedDate = this.layers[id].availableDates[dateIndex]
    this.layers[id].displayedDate = moment(displayedDate, 'YYYYMMDD').format('DD.MM.YYYY')
    this. changeLayerDate(e, id, displayedDate)
  }
  changeOpacity(e, id, opacityValue) {
    for (var ii of this.basemap.getLayers().getArray()) {
      if (ii.getProperties().id === id) {
        ii.setOpacity(opacityValue)
      }
    }
  }  
  changeLayerDate(e, id, layerDate) {
    for (var ii of this.basemap.getLayers().getArray()) {
      if (ii.getProperties().id === id) {
        let newSource = ii.getSource()
        newSource.updateParams({
            'date': layerDate
          });
        ii.setSource(newSource)
      }
    }
  }
}
