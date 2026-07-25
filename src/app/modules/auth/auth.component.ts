import { Component, inject } from '@angular/core';
import { AuthService } from 'src/app/core/auth/auth.service';
import { OverlayService } from 'src/app/core/ui/overlay.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss']
})
export class AuthComponent {
  private auth = inject(AuthService);
  private overlay = inject(OverlayService);

  user$ = this.auth.user$;

  isOpenAuth$ = this.overlay.isOpen$('auth');

  /**
   * The sign-in icon and the signed-in account block both hide behind any open
   * panel, not just their own — the store backdrop covers this corner too, and
   * a control nobody can click should not stay on screen.
   */
  isLauncherHidden$ = this.overlay.anyOpen$;

  isRegister = true;

  toggleAuth() {
    this.overlay.toggle('auth');
  }

  handleForm() {
    this.isRegister = !this.isRegister;
  }

  /** Sign-up and sign-in both land here: close the modal, show the account. */
  onAuthenticated() {
    this.overlay.close();
    this.isRegister = true;
  }

  signOut() {
    this.auth.logout();
  }
}
