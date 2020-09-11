import {inject, NewInstance} from 'aurelia-framework';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';
import * as locations from "../resources/locations/locations.json";
import {I18N} from 'aurelia-i18n';

@inject(NewInstance.of(ValidationController), Router, EventAggregator, HttpClient, I18N)

export class Resetpassword {
  controller;
  newPassword = null;
  confirmPassword = null;
  passwordType = 'password';

  errorMessages = {
    si:
    {
      passwordRequired: 'rabimo',
      paswordLengh: 'mora vsebovati vsaj osem znakov',
      confirmPasswordRequred: ', če ne se ne morate vpisati',
      confirmPasswordMatches: 'ne zgleda enako kot prvo'
    },
    en: {
      passwordRequired: 'was not provided',
      paswordLengh: 'has to be at least eight characters long',
      confirmPasswordRequred: ', else you can not register',
      confirmPasswordMatches: 'does not look like the first one'
    }
  }

  constructor(controller, router, eventAggregator, httpClient, i18n) {
    this.httpClient = httpClient
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controller;
    this.providers = [];

    this.i18n = i18n;
    this.language = this.i18n.getLocale();

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
        || value === obj[otherPropertyName], this.i18n.tr(this.errorMessages[this.language].confirmPasswordMatches)
    );

    ValidationRules
    .ensure(a => a.newPassword)
    .required().withMessage(this.i18n.tr(this.errorMessages[this.language].passwordRequired))
    .minLength(8).withMessage(this.i18n.tr(this.errorMessages[this.language].paswordLengh))
    .ensure(a => a.confirmPassword)
    .required().withMessage(this.i18n.tr(this.errorMessages[this.language].passwordRequired))
    .satisfiesRule('matchesProperty', 'newPassword')
    .on(this)
  };

  subscribe() {}

  resetPassword() {
    this.urlArray = window.location.href.split('/')
    this.resetToken = this.urlArray[this.urlArray.length - 1]
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
