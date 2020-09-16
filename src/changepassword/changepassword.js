import {AuthService} from 'aurelia-authentication';
import {inject, NewInstance} from 'aurelia-dependency-injection';
import {computedFrom} from 'aurelia-framework';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';
import * as locations from "../resources/locations/locations.json";

@inject(NewInstance.of(ValidationController), EventAggregator, AuthService, Router, HttpClient)
export class Resetpassword {
  controller = null;
  oldPassword = null;
  newPassword = null;
  newPasswordConfirm = null;
  passwordType = 'password';


  constructor(controller, eventAggregator, authService, router, httpClient) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;
    this.router = router;
    this.userNotification = false;
    this.httpClient = httpClient;
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
        || value === obj[otherPropertyName], "confirmPasswordMatches");

    ValidationRules
      .ensure(a => a.oldPassword)
      .required().withMessage("passwordRequired")
      .ensure(a => a.newPassword)
      .required().withMessage("passwordRequired")
      .minLength(8).withMessage("paswordLengh")
      .ensure(a => a.newPasswordConfirm)
      .required().withMessage("confirmPasswordRequred")
      .satisfiesRule('matchesProperty', 'newPassword')
      .on(this);
  }

  subscribe() {
    this.ea.subscribe('close-user-notification', notificationStatus => {
      this.userNotification = notificationStatus;
    });
  }

  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  updatePassword() {
    if (this.authService.authenticated) {
      this.passwordUpdate = {
        oldPassword: this.oldPassword,
        newPassword: this.newPassword
      };
      this.controller.validate()
        .then(result  => {
          if (result.valid) {
            this.httpClient.fetch('http://' + locations.backend + '/backendapi/updatepassword', {
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
                this.userNotification = true;
                this.ea.publish('open-user-notification', data);
              })
              .catch(error => {
                this.userNotification = true;
                this.ea.publish('open-user-notification', error);
              });
          }
        });
    }
    else {
      this.router.navigateToRoute('login');
    }
  }

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    }
  }
}
