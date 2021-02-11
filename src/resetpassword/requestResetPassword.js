import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';
import * as locations from "../resources/locations/locations.json";
import {I18N} from 'aurelia-i18n';

@inject(NewInstance.of(ValidationController), EventAggregator, Router, HttpClient, I18N)
export class RequestResetPassword {
  controller = null;

  constructor(controller, eventAggregator, router, httpClient, i18n) {
    this.httpClient = httpClient;
    this.controller = controller;
    this.router = router;
    this.ea = eventAggregator;
    this.email = null;
    this.userNotification = false;
    this.i18n = i18n;
    if (this.i18n.getLocale() === 'SI' || this.i18n.getLocale() === 'sl-SI' || this.i18n.getLocale() === 'si') {
      this.language = 'SI';
    }
    else {
      this.language = 'EN';
    }

    this.subscribe();

    ValidationRules
      .ensure('email')
      .required().withMessage("emailRequired")
      .email().withMessage("emailInvalid")
      .on(this);
  }

  subscribe() {
    this.ea.subscribe('close-user-notification', notificationStatus => {
      this.userNotification = notificationStatus;
    });
  }

  requestResetPassword() {
    this.userEmail = {
      email: this.email,
      language: this.language
    };
    this.controller.validate()
      .then(result  => {
        if (result.valid) {
          this.httpClient.fetch(locations.backend + '/backendapi/requestresetpassword', {
            method: 'POST',
            body: JSON.stringify(this.userEmail),
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json',
              'X-Requested-With': 'Fetch'
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
}
