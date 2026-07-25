import { CommonModule } from '@angular/common';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ClickerComponent } from './clicker.component';
import { ClickerService } from 'src/app/core/clicker/clicker.service';
import { OverlayService } from 'src/app/core/ui/overlay.service';
import { coins, installFakeStorage, prestige, round2, setCoins } from 'src/app/testing/test-utils';

describe('ClickerComponent', () => {
  let component: ClickerComponent;
  let fixture: ComponentFixture<ClickerComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [ClickerComponent]
    });
    fixture = TestBed.createComponent(ClickerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

describe('ClickerComponent popup', () => {
  beforeEach(() => {
    // Installed before the fixture: ClickerService loads its save in the
    // constructor, so a spec that stubs storage afterwards has already read the
    // browser's real one.
    installFakeStorage();
    TestBed.configureTestingModule({
      declarations: [ClickerComponent],
      imports: [CommonModule]
    });
  });

  it('quotes the amount actually banked, not a recomputed one', fakeAsync(() => {
    const fixture = TestBed.createComponent(ClickerComponent);
    const clicker = TestBed.inject(ClickerService);

    prestige(clicker);
    setCoins(clicker, 1000);
    clicker.buyStrongClick();
    fixture.detectChanges();

    const host: HTMLElement = fixture.nativeElement;

    const before = coins(clicker);
    host.querySelector<HTMLButtonElement>('.clicker__wrapper-main-item')?.click();
    fixture.detectChanges();

    const banked = round2(coins(clicker) - before);
    const popup = host.querySelector<HTMLElement>('.clicker__popup');

    expect(popup).withContext('a click should raise a popup').not.toBeNull();

    // The popup used to recompute the payout itself, which is how it came to
    // show a different number from the one the balance moved by.
    expect(popup?.textContent?.trim()).toBe(`+${banked}`);
    // Pin the figure too: a popup re-applying the 1.15 multiplier reads +2.47.
    expect(banked).toBe(2.15);

    tick(1000);
    discardPeriodicTasks();
  }));
});

/**
 * The store and the auth panel are full-screen. Their backdrop already stops a
 * pointer reaching the coin, so the coin has to stop responding to the keyboard
 * at the same moment — otherwise Enter pays out while a click on the identical
 * control does nothing.
 */
describe('ClickerComponent while a panel covers it', () => {
  let fixture: ComponentFixture<ClickerComponent>;
  let overlay: OverlayService;
  let clicker: ClickerService;

  const coinButton = () =>
    (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>(
      '.clicker__wrapper-main-item'
    )!;

  beforeEach(() => {
    installFakeStorage();
    TestBed.configureTestingModule({
      declarations: [ClickerComponent],
      imports: [CommonModule]
    });

    fixture = TestBed.createComponent(ClickerComponent);
    overlay = TestBed.inject(OverlayService);
    clicker = TestBed.inject(ClickerService);
    fixture.detectChanges();
  });

  it('leaves the coin live while nothing is open', () => {
    expect(coinButton().disabled).toBeFalse();
  });

  it('disables the coin, and so drops it from the tab order, while either panel is open', () => {
    for (const panel of ['store', 'auth'] as const) {
      overlay.toggle(panel);
      fixture.detectChanges();
      expect(coinButton().disabled)
        .withContext(`covered by the ${panel} panel`)
        .toBeTrue();

      overlay.close();
      fixture.detectChanges();
      expect(coinButton().disabled)
        .withContext(`${panel} panel closed again`)
        .toBeFalse();
    }
  });

  it('pays out nothing for a keyboard activation while a panel is open', fakeAsync(() => {
    overlay.toggle('store');
    fixture.detectChanges();

    const before = coins(clicker);
    // Enter and Space on a focused button both arrive as a plain click. A
    // disabled button never dispatches one, which is the whole point.
    coinButton().click();
    fixture.detectChanges();

    expect(coins(clicker)).toBe(before);

    overlay.close();
    fixture.detectChanges();

    coinButton().click();
    fixture.detectChanges();
    expect(coins(clicker)).toBeGreaterThan(before);

    tick(1000);
    discardPeriodicTasks();
  }));
});
