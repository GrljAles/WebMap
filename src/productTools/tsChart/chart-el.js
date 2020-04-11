import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import { observable } from 'aurelia-framework';
import {Chart} from 'chart.js';

let instance = null;

@inject(EventAggregator)
@observable('tsChartWindow')
export class ChartEl {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.tsChartWindowDelete = false;
    this.tsChartWindow = false;

    this.subscribe();
    this.subscribe();

    if (!instance) {
      instance = this;
    }
    return instance;
  }
  // Observables observe variable (in method name before 'Chnaged' part) and fire function on change.
  tsChartWindowChanged(newValue, oldValue) {
    this.ea.publish('ts-chart-window-changed', newValue);
  }

  subscribe() {}

  attached() {}

  getRandomColor() {
    let letters = '0123456789ABCDEF';
    let color = '#';
    for (let i = 0; i < 6; i++) {
      color += letters[Math.floor(Math.random() * 16)];
    }
    return color;
  }

  updateChart(datas) {
    if (this.myChart) {
      this.myChart = null;
    }
    for (let ii in datas.datasets) {
      datas.datasets[ii].lineTension = 0;
      datas.datasets[ii].borderColor = this.getRandomColor();
      datas.datasets[ii].fill = false;
    }
    let ctx = document.getElementById('chart');
    this.myChart = new Chart(ctx, {
      type: 'line',
      data: datas,
      options: {
        scales: {
          xAxes: [{
            type: 'time',
            time: {
              unit: 'day'
            }
          }]
        }
      }
    });
    this.myChart.update();
  }

  chartError() {
    console.log('savyxv')
/*     let ctx = document.getElementById('chart');
    let a = document.createElement("h1");
    let node = document.createTextNode('An error ocured')
    a.appendChild(node);
    ctx.appendChild(a); */
  }

  confirmDeleteChart() {
    this.tsChartWindowDelete = true;
  }

  doNotDeleteChart() {
    this.tsChartWindowDelete = false;
  }

  yesDeleteChart() {
    this.tsChartWindow = false;
    this.ea.publish('ts-chart-window-changed', false);
    this.tsChartWindowDelete = false;
  }
}

