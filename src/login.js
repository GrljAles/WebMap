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
    if (this.username && this.password) {
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
/*       var thisUser = { 'username': this.username, 'password': this.password }
      console.log(thisUser);
      return this.authService.login(this.username, this.password); */
    }
    
    

  };
/*     var url = 'http://droughtwatch.eu/cgi-bin/TimeSeriesChart.py?method=POST&firstDate=2010-04-05&secondDate=2010-10-24%x=2942007.16&y=5733535.39&chartProducts=SWI,12_5km'
    d3.json(url, function (error, json) {
      console.log(error, json)
    });
  }; */
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
