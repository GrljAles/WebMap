import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();
@inject(AuthService, ValidationControllerFactory, Router, EventAggregator)

export class Login {
  controller = null;

  constructor(authService, controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;

    this.controller = controllerFactory.createForCurrentScope();

    this.authService = authService;    
    this.providers = [];
    this.subscribe();

    this.userName = 'Hans';
    this.password = 'testisis';
    this.passwordType = 'password';

    ValidationRules
    .ensure('userName')
      .required().withMessage('is required.')
    .ensure('password')
      .required().withMessage('is also required.')
    .on(this)
  };

  subscribe() {
    this.ea.subscribe('logout', (data) => {
      this.logout()
    });
  }
  
  // make a getter to get the authentication status.
  // use computedFrom to avoid dirty checking
  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  login() {
    return this.authService.login({
      userName: this.userName,
      password: this.password,
    })
    .then(response => {
      console.log(response)
      this.ea.publish('user-data-update', {
        userName: response.userName
      })
    })
    .catch(err => {
      console.log(err)
      console.log(err.responseObject.error)
      this.ea.publish('user-data-update', {
        userName: null
      });
      this.ea.publish('notification-data', err.responseObject.error)
    });
  };

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    };
  };

  requestResetPassword(){
    var resetPasswordFor = {userName: this.userName}
    httpClient.fetch('http://84.255.193.232/backend/requestresetpassword', {
    method: 'POST',
    body: JSON.stringify(resetPasswordFor),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'Fetch'
    },
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => this.router.navigateToRoute(data.redirect))
  //.then(data => console.log(data))
}

  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  logout() {
    var refreshToken = {
      jti: this.authService.getRefreshToken()
    };
    var accessToken = {
      jti: this.authService.getAccessToken()
    };

    httpClient.fetch('http://84.255.193.232/backend/logout/refresh', {
    method: 'POST',
    body: JSON.stringify(refreshToken),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'Fetch',
      'Authorization': 'Bearer ' + refreshToken.jti
      //'Access-Control-Allow-Origin': 'http://localhost:8080'
    },
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    for (var key in data) {
      if (key === 'error') {
        this.ea.publish('notification-data', data.error)
      }
    }
  });

  httpClient.fetch('http://84.255.193.232/backend/logout/access', {
    method: 'POST',
    body: JSON.stringify(accessToken),
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'X-Requested-With': 'Fetch',
      'Authorization': 'Bearer ' + accessToken.jti
      //'Access-Control-Allow-Origin': 'http://localhost:8080'
    },
    mode: 'cors'
  })
  .then(response => response.json())
  .then(data => {
    for (var key in data) {
      if (key === 'error') {
        this.ea.publish('notification-data', data.error)
      }
    }
  });
  return this.authService.logout();
  }

}
