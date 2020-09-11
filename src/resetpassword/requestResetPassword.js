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

  errorMessages = {
    si:
    {
      emailRequired: 'morate vpisati',
      emailInvalid: 'ni še veljaven'
    },
    en: {
      emailRequired: 'must be provided',
      emailInvalid: 'is not yet a valid address'
    }
  }

  constructor(controller, eventAggregator, router, httpClient, i18n) {
    this.httpClient = httpClient
    this.controller = controller;
    this.router = router;
    this.ea = eventAggregator;
    this.message = null;
    this.email = null;

    this.i18n = i18n;
    this.language = this.i18n.getLocale();

    ValidationRules
      .ensure('email')
      .required().withMessage(this.i18n.tr(this.errorMessages[this.language].emailRequired))
      .email().withMessage(this.i18n.tr(this.errorMessages[this.language].emailInvalid))
      .on(this)
    }

  requestResetPassword() {
    this.userEmail = {
      email: this.email,
    };
    this.controller.validate()
    .then(result  => {
        if (result.valid) {
          this.httpClient.fetch('http://' + locations.backend + '/backendapi/requestresetpassword', {
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
          window.setTimeout(() => this.ea.publish('user-management-notification', data), 500);
          this.router.navigateToRoute(data.redirect)
        })
      }
    })
  }

  }
