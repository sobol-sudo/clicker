import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthCredentials, GENERIC_AUTH_ERROR } from 'src/app/core/auth/auth.models';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  @Output() authenticated = new EventEmitter<void>();

  loginForm: FormGroup;
  submitted = false;
  loading = false;
  backendError: string | null = null;

  constructor() {
    this.loginForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.backendError = null;
    this.submitted = true;
    if (this.loginForm.invalid || this.loading) return;

    this.loading = true;

    this.auth.login(this.loginForm.getRawValue() as AuthCredentials).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.loginForm.reset();
        this.authenticated.emit();
      },
      error: (err: Error) => {
        this.loading = false;
        this.backendError = err?.message || GENERIC_AUTH_ERROR;
      }
    });
  }
}
