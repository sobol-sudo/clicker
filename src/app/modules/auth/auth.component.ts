import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private auth = inject(AuthService);

  user$ = this.auth.user$;

  isOpenAuth = false;
  isRegister = true;

  toggleAuth() {
    this.isOpenAuth = !this.isOpenAuth;
  }

  handleForm() {
    this.isRegister = !this.isRegister;
  }

  /** Sign-up and sign-in both land here: close the modal, show the account. */
  onAuthenticated() {
    this.isOpenAuth = false;
    this.isRegister = true;
  }

  signOut() {
    this.auth.logout();
  }
}
