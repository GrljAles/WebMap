import {AuthService} from 'aurelia-authentication';
import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {EventAggregator} from 'aurelia-event-aggregator';

@inject(NewInstance.of(ValidationController), EventAggregator, AuthService)
export class Registration {
  controller;
  message = '';
  firstName = 'Ales';
  lastName = 'Grlj'
  userName = 'Hans';
  email = 'alesinar.grlj@gmail.com';
  password = 'testisis';
  confirmPassword = 'testisis';
  passwordType = 'password';

  constructor(controller, eventAggregator, authService) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;

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
      .then(result  => {
        if (result.valid) {
          return this.authService.signup({
            firstName: this.firstName,
            lastName: this.lastName,
            userName: this.userName,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword
          })
          .then(response => {
            if (response) {
              console.log(response)
              window.setTimeout(() => this.ea.publish('user-management-notification', response), 500);
            }
          })
          .catch(err => {
            this.ea.publish('user-data-update', {userName: null});
            window.setTimeout(() => this.ea.publish('user-management-notification', response), 500);
          });
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
};
