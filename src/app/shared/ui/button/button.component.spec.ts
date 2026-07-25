import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ButtonComponent } from './button.component';

describe('ButtonComponent', () => {
  let component: ButtonComponent;
  let fixture: ComponentFixture<ButtonComponent>;
  let native: HTMLButtonElement;
  let emissions: number;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ButtonComponent]
    });
    fixture = TestBed.createComponent(ButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();

    native = component.btn.nativeElement;
    emissions = 0;
    component.btnClick.subscribe(() => emissions++);
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('emits once per click', () => {
    native.click();
    expect(emissions).toBe(1);
  });

  it('emits once for a tap, not once per compatibility event', () => {
    // A touch is followed by compatibility mouse events and then a single
    // click; only the click may emit, or one tap buys two upgrades.
    native.dispatchEvent(new Event('touchstart'));
    native.dispatchEvent(new Event('touchend'));
    native.dispatchEvent(new Event('mousedown'));
    native.dispatchEvent(new Event('mouseup'));
    native.click();

    expect(emissions).toBe(1);
  });

  it('renders a real button type and keeps the variant out of it', () => {
    // `type="default"` is not a value the HTML spec defines, so browsers fall
    // back to the submit state. Writing the look into the type attribute is
    // what made the sign-in and sign-up buttons submit by accident.
    expect(native.getAttribute('type')).toBe('button');
    expect(native.type).toBe('button');
    expect(native.getAttribute('data-variant')).toBe('default');

    component.nativeType = 'submit';
    component.type = 'danger';
    fixture.detectChanges();

    expect(native.type).toBe('submit');
    expect(native.getAttribute('data-variant')).toBe('danger');
  });

  it('does not emit while disabled', () => {
    component.disabled = true;
    fixture.detectChanges();

    expect(native.disabled).toBe(true);

    native.click();
    component.onClick(new Event('click'));

    expect(emissions).toBe(0);
  });
});
