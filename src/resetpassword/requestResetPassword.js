import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {EventAggregator} from 'aurelia-event-aggregator';
import {Router} from 'aurelia-router';

@inject(NewInstance.of(ValidationController), EventAggregator, Router, HttpClient)
export class RequestResetPassword {
  controller = null;

  constructor(controller, eventAggregator, router, httpClient) {
    this.httpClient = httpClient
    this.controller = controller;
    this.router = router;
    this.ea = eventAggregator;
    this.message = '';
    this.email = 'alesinar.grlj@gmail.com';

    ValidationRules
      .ensure('email')
        .required().withMessage('must be provided.')
        .email().withMessage('is not yet a valid address.')
      .on(this)
    }

  requestResetPassword() {
    this.userEmail = {
      email: this.email,
    };
    this.controller.validate()
    .then(result  => {
        if (result.valid) {
          this.httpClient.fetch('http://84.255.193.232/backend/requestresetpassword', {
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
          console.log(data.redirect)
          window.setTimeout(() => this.ea.publish('user-management-notification', data), 500);
          this.router.navigateToRoute(data.redirect)
        })
      }
    })
  }

  }
