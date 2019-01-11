import {inject} from 'aurelia-framework';
import {EventAggregator} from 'aurelia-event-aggregator';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();
@inject(EventAggregator)

export class Redirectnotification {
  constructor(eventAggregator) {
    this.ea = eventAggregator;
    this.message = null
    this.subscribe();
  }

  attached() {
    document.addEventListener('aurelia-started', 
    httpClient.fetch('http://84.255.193.232/backend/confirm/i', {
      method: 'post',
      body: {},
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch'
      },
      mode: 'cors'
    })
    .then(response => response.json())
    .then(data => {
      this.message = data.message
    }))

}

  subscribe(){
/*     this.ea.subscribe('user-management-notification', (notification) => {
      console.log(this.userManagementNotification)
      this.userManagementNotification = notification;
      console.log(this.userManagementNotification)
    }); */
  }
}
