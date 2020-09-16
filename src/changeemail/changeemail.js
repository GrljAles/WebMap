import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';
import * as locations from "../resources/locations/locations.json";

@inject(AuthService, ValidationControllerFactory, Router, EventAggregator, HttpClient)
export class ChangeEmail {
  controller = null;

  constructor(authService, controllerFactory, router, eventAggregator, httpClient) {
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();
    this.authService = authService;
    this.httpClient = httpClient;

    this.providers = [];
    this.newEmail = null;
    this.userNotification = false;

    this.subscribe();

    ValidationRules
      .ensure('newEmail')
      .required().withMessage("emailRequired")
      .email().withMessage("emailInvalid")
      .on(this)
  };

  subscribe() {
    this.ea.subscribe('close-user-notification', notificationStatus => {
      this.userNotification = notificationStatus;
    });
  }

  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  updateEmail() {
    if (this.authService.authenticated) {
      this.emailUpdate = {
        newEmail: this.newEmail
      };
      this.controller.validate()
        .then(result  => {
          if (result.valid) {
            this.httpClient.fetch('http://' + locations.backend + '/backendapi/updateemail', {
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
      this.router.navigateToRoute('login')
    }
  }
}
