import {inject} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {HttpClient} from 'aurelia-fetch-client';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';

let httpClient = new HttpClient();
@inject(ValidationControllerFactory, Router, EventAggregator)

export class Resetpassword {
  controller = null;
  newPassword = null
  passwordType = 'password';

  constructor(controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();
    this.providers = [];
    this.subscribe();

    ValidationRules
    .ensure('password')
      .required().withMessage('is also required.')
      .minLength(8).withMessage('should be at least 8 characters long.')
    .on(this)
  };

  subscribe() {}

  resetPassword() {
    this.urlArray = window.location.href.split('/')
    this.resetToken = this.urlArray[this.urlArray.length - 1]
    console.log(this.resetToken)
    this.resetPassword = {
      password: this.newPassword,
      token: this.resetToken
    };
    httpClient.fetch('http://84.255.193.232/backend/resetpassword/' + this.resetToken, {
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
    console.log(data)
    this.router.navigateToRoute(data.redirect)
  })
}

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
      console.log(window.location.href)
    }
    else {
      this.passwordType = 'password'
    };
  };
}
