import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/core/api/api.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);

  loginForm: FormGroup;
  submitted = false;
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
    if (this.loginForm.invalid) return;

    this.apiService.loginUser(this.loginForm.value)
      .subscribe({
        next: res => console.log('Login successful', res),
        error: err => {
          console.log(err)
          this.backendError = err.error.message
        }
      });
  }
}
