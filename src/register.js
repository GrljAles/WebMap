import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationControllerFactory, ValidationRules} from 'aurelia-validation';
import 'fetch';
import {HttpClient, json} from 'aurelia-fetch-client';

let httpClient = new HttpClient();
@inject(ValidationControllerFactory)
export class Register {
  controller = null;
  firstName = null;
  lastName = null
  userName = null;
  email = null;
  password = null;
  confirmPassword = null;
  passwordType = 'password';

  constructor(controllerFactory) {
    this.controller = controllerFactory.createForCurrentScope();
    ValidationRules.customRule(
      'matchesProperty',
      (value, obj, otherPropertyName) =>
        value === null
        || value === undefined
        || value === ''
        || obj[otherPropertyName] === null
        || obj[otherPropertyName] === undefined
        || obj[otherPropertyName] === ''
        || value === obj[otherPropertyName],
      "? This dosen't look like the same password"
    );

    ValidationRules
      .ensure('firstName')
        .required().withMessage('is required.')
      .ensure('lastName')
        .required().withMessage('is also required.')
      .ensure('userName')
        .required().withMessage('cannot be blank.')
      .ensure('email')
        .required().withMessage('must be provided.')
        .email().withMessage('you provided is not a valid address.')
      .ensure(a => a.password)
        .required().withMessage('was not provided.')
        .minLength(8).withMessage('should be at least 8 characters long.')
      .ensure(a => a.confirmPassword)
        .required().withMessage(' else you cannot register.')
        .satisfiesRule('matchesProperty', 'password')
      .on(this)
  }
  register() {
    this.controller.validate()
     .then(result => {
       if (result.valid) {
        var json= {
          pleaseDo: 'register',
          firstName: this.firstName,
          lastName: this.lastName,
          userName: this.userName,
          email: this.email,
          password: this.password,
          confirmPassword: this.confirmPassword
        };
         console.log(JSON.stringify(json))
       };
    });
/*    httpClient.fetch('http://84.255.193.232/backend', {
      method: 'POST',
      body: JSON.stringify(json),
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-Requested-With': 'Fetch'
      },
      mode: 'cors'
    })
    .then(response => response.json())
    .then(data => console.log(data))*/
  };
  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text'
    }
    else {
      this.passwordType = 'password'
    };
  };
};




