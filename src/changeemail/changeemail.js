import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';
import * as locations from "../resources/locations/locations.json";

let httpClient = new HttpClient();
@inject(AuthService, ValidationControllerFactory, Router, EventAggregator)
export class ChangeEmail {
  controller = null;

  constructor(authService, controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;

    this.controller = controllerFactory.createForCurrentScope();

    this.authService = authService;
    this.providers = [];
    this.subscribe();

    this.newEmail = null;

    ValidationRules
    .ensure('newEmail')
      .required().withMessage('is required.')
    .on(this)
  };

  subscribe() {
  }

  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  updateEmail() {
    if (this.authService.authenticated) {
      this.emailUpdate = {
        newEmail: this.newEmail,
      };
      this.controller.validate()
      .then(result  => {
          if (result.valid) {
            httpClient.fetch('http://' + locations.backend + '/backend/updateemail', {
            method: 'POST',
            body: JSON.stringify(this.emailUpdate),
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
            window.setTimeout(() => this.ea.publish('user-management-notification', data), 500);
            this.router.navigateToRoute(data.redirect)
          })
        }
      })
    }
    else {
      this.router.navigateToRoute('login')
    }
  }

}
