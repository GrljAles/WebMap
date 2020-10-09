import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as locations from "./resources/locations/locations.json";
import {Cookies} from 'aurelia-plugins-cookies';

@inject(AuthService, ValidationControllerFactory, Router, EventAggregator)
export class Login {
  controller = null;
  constructor(authService, controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();
    this.authService = authService;    
    this.providers = [];

    this.userName = 'alesinar';
    this.password = 'Jebote12';
    this.passwordType = 'password';

    this.userNotification = false;
    this.subscribe();

    ValidationRules
      .ensure('userName')
      .required().withMessage("usernameRequired")
      .ensure('password')
      .required().withMessage("passwordRequired")
      .on(this);
  }
  // make a getter to get the authentication status.
  // use computedFrom to avoid dirty checking
  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  subscribe() {
    this.ea.subscribe('close-user-notification', notificationStatus => {
      this.userNotification = notificationStatus;
    });
  }

  login() {
    if (Cookies.get('consentCookie')) {
      this.controller.validate()
        .then(result  => {
          if (result.valid) {
            return this.authService.login({
              userName: this.userName,
              password: this.password
            });
          }
        })
        .then(data => {
          this.ea.publish('user-data-update', {
            userName: data.userName,
            email: data.email
          });
        })
        .catch(error => {
          this.userNotification = true;
          this.ea.publish('open-user-notification', error.responseObject);
        });
    }
  }

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    } else {
      this.passwordType = 'password';
    }
  }

  requestResetPassword() {
    let resetPasswordFor = {userName: this.userName}
    httpClient.fetch('http://' + locations.backend + '/backend/resetpassword', {
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
      .then(data => {
        window.setTimeout(() => this.ea.publish('user-management-notification', data), 500);
        this.router.navigateToRoute(data.redirect);
      });
  }
}
