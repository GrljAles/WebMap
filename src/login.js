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
    this.subscribe();

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
      //console.log(response)
      this.ea.publish('user-data-update', {
        userName: response.message
      })

    })
    .catch(err => {
      //console.log(err)
      this.ea.publish('user-data-update', {
        userName: null
      });
      this.ea.publish('notification-data', 'Invalid credentials')
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

  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  logout() {
    return this.authService.logout();
  }

}
