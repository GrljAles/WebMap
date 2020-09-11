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
  errorMessages = {
    si:
    {
      firstNameRequred: 'rabimo',
      lastNameRequired: 'tudi rabimo',
      usernameRequired: 'ne sme biti prazno',
      emailRequired: 'morate vpisati',
      emailInvalid: 'ni veljaven',
      passwordRequired: 'ni bilo vpisano',
      paswordLengh: 'mora vsebovati vsaj osem znakov',
      confirmPasswordRequred: ', če ne se ne morate vpisati',
      confirmPasswordMatches: 'ne zgleda enako kot prvo'
    },
    en: {
      firstNameRequred: 'is required',
      lastNameRequired: 'is also required',
      usernameRequired: 'can not be empty',
      emailRequired: 'has to be provided',
      emailInvalid: 'is not a valid email address',
      passwordRequired: 'was not provided',
      paswordLengh: 'has to be at least eight characters long',
      confirmPasswordRequred: ', else you can not register',
      confirmPasswordMatches: 'does not look like the first one'
    }
  }

  constructor(controller, eventAggregator, authService, i18n) {
    this.controller = controller;
    this.ea = eventAggregator;
    this.authService = authService;
    this.i18n = i18n;
    this.language = this.i18n.getLocale();

    ValidationRules.customRule(
      'matchesProperty',
      (value, obj, otherPropertyName) =>
        value === null
        || value === undefined
        || value === ''
        || obj[otherPropertyName] === null
        || obj[otherPropertyName] === undefined
        || obj[otherPropertyName] === ''
        || value === obj[otherPropertyName], this.i18n.tr(this.errorMessages[this.language].confirmPasswordMatches)
    );

    ValidationRules
      .ensure('firstName')
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].firstNameRequred))
      .ensure('lastName')
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].lastNameRequired))
      .ensure('userName')
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].usernameRequired))
      .ensure('email')
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].emailRequired))
        .email().withMessage(this.i18n.tr(this.errorMessages[this.language].emailInvalid))
      .ensure(a => a.password)
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].passwordRequired))
        .minLength(8).withMessage(this.i18n.tr(this.errorMessages[this.language].paswordLengh))
      .ensure(a => a.confirmPassword)
        .required().withMessage(this.i18n.tr(this.errorMessages[this.language].confirmPasswordRequred))
        .satisfiesRule('matchesProperty', 'password')
      .on(this);
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
