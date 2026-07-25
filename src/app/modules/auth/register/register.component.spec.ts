import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { RegisterComponent } from './register.component';
import { FormInputModule } from 'src/app/shared/ui/form-input/form-input.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/ui/button/button.module';
import { AuthService } from 'src/app/core/auth/auth.service';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;

  const clearStorage = () => {
    localStorage.removeItem('clicker.auth.users');
    localStorage.removeItem('clicker.auth.session');
  };

  beforeEach(() => {
    clearStorage();

    TestBed.configureTestingModule({
      declarations: [RegisterComponent],
      imports: [FormInputModule, ReactiveFormsModule, ButtonModule, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(clearStorage);

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /** The button has no click handler; submitting the form is the wiring. */
  it('submits the form from the rendered button', () => {
    const submit = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'form button'
    )!;

    expect(submit.type).toBe('submit');

    component.registerForm.setValue({ username: 'ada', password: 'lovelace1' });
    submit.click();

    expect(TestBed.inject(AuthService).user?.username).toBe('ada');
  });

  it('does not submit an invalid form', () => {
    let emitted = false;
    component.authenticated.subscribe(() => (emitted = true));

    component.registerForm.setValue({ username: 'ab', password: 'short' });
    component.onSubmit();

    expect(emitted).toBe(false);
    expect(component.submitted).toBe(true);
    expect(TestBed.inject(AuthService).user).toBeNull();
  });

  it('signs the user in and announces success', () => {
    let emitted = false;
    component.authenticated.subscribe(() => (emitted = true));

    component.registerForm.setValue({ username: 'grace', password: 'hopper01' });
    component.onSubmit();

    expect(emitted).toBe(true);
    expect(component.loading).toBe(false);
    expect(component.backendError).toBeNull();
    expect(TestBed.inject(AuthService).user?.username).toBe('grace');
  });

  it('shows a readable message when registration is rejected', () => {
    component.registerForm.setValue({ username: 'grace', password: 'hopper01' });
    component.onSubmit();

    component.registerForm.setValue({ username: 'grace', password: 'hopper01' });
    component.onSubmit();

    expect(component.loading).toBe(false);
    expect(component.backendError).toBe('That username is already taken.');
  });
});
