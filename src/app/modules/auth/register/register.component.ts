import { Component, EventEmitter, inject, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from 'src/app/core/auth/auth.service';
import { AuthCredentials, GENERIC_AUTH_ERROR } from 'src/app/core/auth/auth.models';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);

  @Output() authenticated = new EventEmitter<void>();

  registerForm: FormGroup;
  submitted = false;
  loading = false;
  backendError: string | null = null;

  constructor() {
    this.registerForm = this.fb.group({
      username: ['', [Validators.required, Validators.minLength(3)]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.backendError = null;
    this.submitted = true;
    if (this.registerForm.invalid || this.loading) return;

    this.loading = true;

    this.auth.register(this.registerForm.getRawValue() as AuthCredentials).subscribe({
      next: () => {
        this.loading = false;
        this.submitted = false;
        this.registerForm.reset();
        this.authenticated.emit();
      },
      error: (err: Error) => {
        this.loading = false;
        this.backendError = err?.message || GENERIC_AUTH_ERROR;
      }
    });
  }
}
