import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ApiService } from 'src/app/core/api/api.service';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent {
  private fb = inject(FormBuilder);
  private apiService = inject(ApiService);
  registerForm: FormGroup;
  submitted = false;
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
    if (this.registerForm.invalid) return;

    this.apiService.registerUser(this.registerForm.value)
      .subscribe({
        next: res => console.log('Registration successful', res),
        error: err => {
          console.log(err)
          this.backendError = err.error.message
        }
      });
  }
}
