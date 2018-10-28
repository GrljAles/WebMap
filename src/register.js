import {inject} from 'aurelia-framework';

export class Register {
  firstName = '';
  lastName = '';
  userName = '';
  email = '';
  password = '';
  confirmPassword = '';

  constructor() {
  }
  register() {
    var regData= { firstName: this.firstName, lastName: this.lastName, userName: this.userName, email: this.email, password: this.password, confirmPassword: this.confirmPassword }
    console.log(regData);
 };
}
