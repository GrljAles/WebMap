import {AuthService} from 'aurelia-authentication';
import {inject, NewInstance} from 'aurelia-dependency-injection';
import {ValidationRules, ValidationController} from 'aurelia-validation';
import {EventAggregator} from 'aurelia-event-aggregator';
import {I18N} from 'aurelia-i18n';

@inject(NewInstance.of(ValidationController), EventAggregator, AuthService, I18N)
export class Registration {
  controller;
  message = '';
  firstName = '';
  lastName = ''
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';
  passwordType = 'password';

  constructor(controller, eventAggregator, authService, i18n) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;
    this.i18n = i18n;
    this.userNotification = false;
    if (this.i18n.getLocale() === 'SI' || this.i18n.getLocale() === 'sl-SI' || this.i18n.getLocale() === 'si') {
      this.language = 'SI';
    }
    else {
      this.language = 'EN';
    }
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
        || value === obj[otherPropertyName], "confirmPasswordMatches");

    ValidationRules
      .ensure('firstName')
        .required().withMessage("firstNameRequred")
      .ensure('lastName')
        .required().withMessage("lastNameRequired")
      .ensure('userName')
        .required().withMessage("usernameRequired")
      .ensure('email')
        .required().withMessage("emailRequired")
        .email().withMessage("emailInvalid")
      .ensure(a => a.password)
        .required().withMessage("passwordRequired")
        .minLength(8).withMessage("paswordLengh")
      .ensure(a => a.confirmPassword)
        .required().withMessage("confirmPasswordRequred")
        .satisfiesRule('matchesProperty', 'password')
      .on(this);
    }

  subscribe() {
    this.ea.subscribe('close-user-notification', notificationStatus => {
      this.userNotification = notificationStatus;
    });
  }

  register() {
    this.controller.validate()
      .then(result  => {
        console.log(this.language)
        if (result.valid) {
          return this.authService.signup({
            firstName: this.firstName,
            lastName: this.lastName,
            userName: this.userName,
            email: this.email,
            password: this.password,
            confirmPassword: this.confirmPassword,
            language: this.language
          })
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

  revealPassword() {
    if (this.passwordType === 'password') {
      this.passwordType = 'text';
    }
    else {
      this.passwordType = 'password';
    }
  }
}
