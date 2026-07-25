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

  it('does not emit while disabled', () => {
    component.disabled = true;
    fixture.detectChanges();

    expect(native.disabled).toBe(true);

    native.click();
    component.onClick(new Event('click'));

    expect(emissions).toBe(0);
  });
});
