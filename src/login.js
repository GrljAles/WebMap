import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import authConfig from 'authConfig';
import { Router } from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();
@inject(AuthService, ValidationControllerFactory, Router, EventAggregator)

export class Login {
  controller = null;
  userName = 'Hans';
  password = 'testisis';
  passwordType = 'password';

  constructor(authService, controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;

    this.controller = controllerFactory.createForCurrentScope();

    this.authService = authService;    
    this.providers = [];

    ValidationRules
    .ensure('userName')
      .required().withMessage('is required.')
    .ensure('password')
      .required().withMessage('is also required.')
    .on(this)
  };

  
  // make a getter to get the authentication status.
  // use computedFrom to avoid dirty checking
  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

/*   httpClient.fetch('http://84.255.193.232/backend/poster',{
      method: 'POST',
      body: JSON.stringify({userName:this.userName,password:this.password, localToken:localStorage[authConfig.tokenName]}),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch'
      },
      mode: 'cors'
    }) */

/*   login() {
    var headers = new Headers();
    return this.authService.login(JSON.stringify({userName:this.userName,password:this.password}))
    .then(response => {
        console.log("success logged " + response);
    })
    .catch(err => {
        console.log("login failure");
    });
    } */
    login() {
    this.controller.validate()
    .then(result => {
      if (result.valid) {
        var loginUser= {
          pleaseDo: 'login',
          userName: this.userName,
          password: this.password,
        };
        httpClient.fetch('http://84.255.193.232/backend/login', {
        method: 'POST',
        body: JSON.stringify(loginUser),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'Fetch'
          //'Access-Control-Allow-Origin': 'http://localhost:8080'
        },
        mode: 'cors'
      })
        .then((response) => response.json())
        .then((data) => {
          console.log(data)
        localStorage[authConfig.accessToken] = data.access_token;
        localStorage[authConfig.refreshToken] = data.refresh_token;
        //this.authService.authenticated = true
        this.ea.publish('user-image', this.authService.authenticated)
        this.router.navigateToRoute('basemap');
      }) 
    }
  })
};  

  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    };
  };
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
