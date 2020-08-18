import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Chart} from 'chart.js';

let instance = null;

@inject(EventAggregator)
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
        legend: {
          labels:{
            fontFamily: "-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, Oxygen-Sans, Ubuntu, Cantarell, Helvetica Neue, sans-serif"
          }
        },
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
  confirmDeleteChart() {
    this.tsChartWindowDelete = true;
  }

  doNotDeleteChart() {
    this.tsChartWindowDelete = false;
  }

  yesDeleteChart() {
    this.ea.publish('ts-chart-window-changed', false);
    this.tsChartWindow = false;
    this.tsChartWindowDelete = false;
  }

  downloadChart() {
    let a = window.document.createElement('a');
    let chEl = window.document.getElementById('chart');
    let file = chEl.toDataURL("image/png");
    a.href = file;
    a.download = 'tsChart.png';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }
}

