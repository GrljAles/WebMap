import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import {Router} from 'aurelia-router';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(AuthService, ValidationControllerFactory, Router, EventAggregator)
export class Login {
  controller = null;
  constructor(authService, controllerFactory, router, eventAggregator) {
    this.ea = eventAggregator;
    this.router = router;
    this.controller = controllerFactory.createForCurrentScope();
    this.authService = authService;    
    this.providers = [];

    this.userName = '';
    this.password = '';
    this.passwordType = 'password';

    ValidationRules
    .ensure('userName')
      .required().withMessage('is required.')
    .ensure('password')
      .required().withMessage('is also required.')
    .on(this)
  };

  
  // make a getter to get the authentication status.
  // use computedFrom to avoid dirty checking
  @computedFrom('authService.authenticated')
  get authenticated() {
    return this.authService.authenticated;
  }

  login() {
    this.controller.validate()
      .then(result  => {
        if (result.valid) {
          return this.authService.login({
            userName: this.userName,
            password: this.password,
          })
          .then(response => {
            this.ea.publish('user-data-update', {
              userName: response.userName
            })
          })
          .catch(err => {
            this.ea.publish('user-data-update', {userName: null});
            window.setTimeout(() => this.ea.publish('user-management-notification', err.responseObject), 500);

            this.router.navigateToRoute(err.responseObject.redirect)
          });
        };
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

  requestResetPassword(){
    var resetPasswordFor = {userName: this.userName}
    httpClient.fetch('http://' + locations.backend + '/backend/resetpassword', {
    method: 'POST',
    body: JSON.stringify(resetPasswordFor),
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

  

}
