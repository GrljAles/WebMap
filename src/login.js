import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();
@inject(AuthService)
export class Login {
  username = null;
  password = null;
  constructor(authService) {
    this.authService   = authService;
    this.providers     = [];

  };
  // make a getter to get the authentication status.
  // use computedFrom to avoid dirty checking
  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }
  login() {
    var json = {
      'tool': 'timeSeriesChart',
      'firstDate':chartParameters[2],
      'secondDate':chartParameters[3],
      'x':graphCoor[0],
      'y':graphCoor[1],
      'chartProducts':chartParameters[6]
    }
    this.httpClient.fetch('http://84.255.193.232/backend', {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch'
      },
      mode: 'cors'
    })
      .then(response => response.json())
      .then(data => console.log(data))


/*     if (this.username && this.password) {
      var thisUser = { 'username': this.username, 'password': this.password }
      httpClient.fetch('http://192.168.64.103/backend', {
        method: 'POST',
        body: JSON.stringify(thisUser),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'Fetch'
        },
        mode: 'cors'
      })
      .then(response => response.json())
      .then(data => {
         console.log(data);
      });
    } */
  };

  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  logout() {
    return this.authService.logout();
  }

  // use authenticate(providerName) to get third-party authentication
  authenticate(name) {
    return this.authService.authenticate(name)
      .then(response => {
        this.provider[name] = true;
      });
  }
}
