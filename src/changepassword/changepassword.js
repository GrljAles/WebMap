import {AuthService} from 'aurelia-authentication';
import {inject, NewInstance} from 'aurelia-dependency-injection';
import {computedFrom} from 'aurelia-framework';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient, json} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';

let httpClient = new HttpClient();
@inject(NewInstance.of(ValidationController), EventAggregator, AuthService, Router)

export class Resetpassword {
  controller = null;
  oldPassword = null;
  newPassword = null;
  newPasswordConfirm = null;
  passwordType = 'password';

  constructor(controller, eventAggregator, authService, router) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;
    this.router = router;
    this.subscribe();

    ValidationRules.customRule(
      'matchesProperty',
      (value, obj, otherPropertyName) =>
        value === null
        || value === undefined
        || value === ''
        || obj[otherPropertyName] === null
        || obj[otherPropertyName] === undefined
        || obj[otherPropertyName] === ''
        || value === obj[otherPropertyName],
      "? This dosen't look like the same password"
    );

    ValidationRules
    .ensure(a => a.oldPassword)
      .required().withMessage('was not provided.')
      .minLength(8).withMessage('is supposed to be at least 8 characters long.')
    .ensure(a => a.newPassword)
      .required().withMessage('was not provided.')
      .minLength(8).withMessage('should be at least 8 characters long.')
    .ensure(a => a.newPasswordConfirm)
      .required().withMessage('else you cannot register.')
      .satisfiesRule('matchesProperty', 'newPassword')
    .on(this)
  };

  subscribe() {}

  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  updatePassword() {
    if (this.authService.authenticated) {
      this.passwordUpdate = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword,
      };
      this.controller.validate()
      .then(result  => {
          if (result.valid) {
            httpClient.fetch('http://84.255.193.232/backend/updatepassword', {
            method: 'POST',
            body: JSON.stringify(this.passwordUpdate),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'Fetch',
              'Authorization': 'Bearer ' + this.authService.getAccessToken()
            },
            mode: 'cors'
          })
          .then(response => response.json())
          .then(data => {
            console.log(data)
            window.setTimeout(() => this.ea.publish('user-management-notification', data.message), 500);
            this.router.navigateToRoute(data.redirect)
          })
        }
      })
    }
    else {
      this.router.navigateToRoute('login')
    }
  }

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    };
  };
}
