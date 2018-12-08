import {AuthService} from 'aurelia-authentication';
import {inject, computedFrom} from 'aurelia-framework';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';
let httpClient = new HttpClient();
@inject(AuthService, ValidationControllerFactory)
export class Login {
  controller = null;
  username = null;
  password = null;
  passwordType = 'password';
  constructor(authService, controllerFactory) {
    this.controller = controllerFactory.createForCurrentScope();
    this.authService = authService;
    this.providers = [];

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
    .then(result => {
      if (result.valid) {
        var thisUser = {
          'pleaseDo': 'login',
          'username': this.username,
          'password': this.password 
        }
        httpClient.fetch('http://84.255.193.232/backend', {
        method: 'POST',
        body: JSON.stringify(thisUser),
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'X-Requested-With': 'Fetch'
        },
        mode: 'cors'
      })
      .catch(error => console.log(error) )
      .then(response => response.json())
      .then(data => console.log(data))
    }
  })
};

  // use authService.logout to delete stored tokens
  // if you are using JWTs, authService.logout() will be called automatically,
  // when the token expires. The expiredRedirect setting in your authConfig
  // will determine the redirection option
  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    };
  };
  logout() {
    return this.authService.logout();
  }

  // use authenticate(providerName) to get third-party authentication
  authenticate(name) {
    return this.authService.authenticate(name)
      .then(response => {
        this.provider[name] = true;
      });
  }
}
