import {AuthService} from 'aurelia-authentication';
import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();
@inject(NewInstance.of(ValidationController), EventAggregator, AuthService)

export class Resetpassword {
  controller = null;
  oldPassword = null;
  newPassword = null;
  newPasswordConfirm = null;
  passwordType = 'password';

  constructor(controller, eventAggregator, authService) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;
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

  updatePassword() {
    this.passwordUpdate = {
      newPassword: this.newPassword,
      access_token: this.authService.getAccessToken()
    };
    this.controller.validate()
    .then(result  => {
        if (result.valid) {
          httpClient.fetch('http://84.255.193.232/backend/updateemail', {
          method: 'POST',
          body: JSON.stringify(this.passwordUpdate),
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
            'X-Requested-With': 'Fetch'
          },
          mode: 'cors'
        })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          this.ea.publish('user-management-notification', data.messsage)
          this.router.navigateToRoute(data.redirect)
        })
      }
    })
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
