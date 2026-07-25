import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { LoginComponent } from './login.component';
import { FormInputModule } from 'src/app/shared/ui/form-input/form-input.module';
import { ReactiveFormsModule } from '@angular/forms';
import { ButtonModule } from 'src/app/shared/ui/button/button.module';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [LoginComponent],
      imports: [HttpClientTestingModule, FormInputModule, ReactiveFormsModule, ButtonModule]
    });
    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  /**
   * The button carries no click handler of its own — submitting the form is the
   * whole mechanism. It used to render `type="default"`, which is not a value
   * the HTML spec defines, so it only submitted because browsers fall back to
   * the submit state on an unknown type. Correcting that attribute to `button`
   * would have quietly turned sign-in into a control that does nothing.
   */
  it('submits the form from the rendered button', () => {
    const submit = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      'form button'
    )!;

    expect(submit.type).toBe('submit');

    const onSubmit = spyOn(component, 'onSubmit');
    submit.click();

    expect(onSubmit).toHaveBeenCalled();
  });
});
