import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';

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
    this.emailUpdate = {
      newEmail: this.newEmail,
      access_token: this.authService.getAccessToken()
    };
    this.controller.validate()
    .then(result  => {
        if (result.valid) {
          httpClient.fetch('http://84.255.193.232/backend/updateemail', {
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
          console.log(data)
          window.setTimeout(() => this.ea.publish('user-management-notification', data.message), 500);
          this.router.navigateToRoute(data.redirect)
        })
      }
    })
  }

}
