import {inject, NewInstance} from 'aurelia-framework';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as locations from "../resources/locations/locations.json";

@inject(NewInstance.of(ValidationController), Router, EventAggregator, HttpClient)

export class Resetpassword {
  controller;
  newPassword = null;
  confirmPassword = null;
  passwordType = 'password';

  constructor(controller, router, eventAggregator, httpClient) {
    this.httpClient = httpClient;
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controller;
    this.providers = [];

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
        || value === obj[otherPropertyName], "confirmPasswordMatches"
    );

    ValidationRules
      .ensure(a => a.newPassword)
        .required().withMessage("passwordRequired")
        .minLength(8).withMessage("paswordLengh")
      .ensure(a => a.confirmPassword)
        .required().withMessage("confirmPasswordRequred")
        .satisfiesRule('matchesProperty', 'newPassword')
      .on(this);
    }

  subscribe() {}

  resetPassword() {
    this.urlArray = window.location.href.split('/')
    this.resetToken = this.urlArray[this.urlArray.length - 1];
    this.resetPassword = {
      password: this.newPassword,
      token: this.resetToken
    };
    this.controller.validate()
      .then(result  => {
        if (result.valid) {
          this.httpClient.fetch('http://' + locations.backend + '/backendapi/resetpassword/' + this.resetToken, {
            method: 'POST',
            body: JSON.stringify(this.resetPassword),
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
              this.router.navigateToRoute(data.redirect)
            });
        }
      });
  }

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    }
    else {
      this.passwordType = 'password';
    }
  }
}
