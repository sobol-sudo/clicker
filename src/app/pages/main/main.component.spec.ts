import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { MainComponent } from './main.component';
import { CommonModule } from '@angular/common';
import { ClickerModule } from 'src/app/modules/clicker/clicker.module';
import { StoreModule } from 'src/app/modules/store/store.module';
import { AuthModule } from 'src/app/modules/auth/auth.module';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { ClickerService } from 'src/app/core/clicker/clicker.service';
import {
  advertisedAmount,
  coins,
  installFakeStorage,
  prestige,
  round2,
  setCoins
} from 'src/app/testing/test-utils';


describe('MainComponent', () => {
  let component: MainComponent;
  let fixture: ComponentFixture<MainComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [MainComponent],
      imports: [CommonModule, ClickerModule, StoreModule, AuthModule, HttpClientTestingModule]
    });
    fixture = TestBed.createComponent(MainComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/**
 * The store, the auth panel and the coin only meet on this page, and both bugs
 * this suite guards against live in that meeting: the store advertising one
 * payout while the coin credits another, and a launcher left on screen under an
 * overlay that eats its clicks. These drive the real DOM for that reason.
 */
describe('MainComponent store and clicker together', () => {
  let fixture: ComponentFixture<MainComponent>;

  function host(): HTMLElement {
    return fixture.nativeElement;
  }

  function query<T extends HTMLElement>(selector: string): T {
    const element = host().querySelector<T>(selector);
    expect(element).withContext(`missing ${selector}`).not.toBeNull();
    return element as T;
  }

  function storeButton(label: string): HTMLButtonElement {
    const buttons = Array.from(
      host().querySelectorAll<HTMLButtonElement>('.store__content button.btn')
    );
    const match = buttons.find(button => button.textContent?.includes(label));
    expect(match).withContext(`missing store button "${label}"`).toBeDefined();
    return match as HTMLButtonElement;
  }

  /** Clicks the coin the way a player does and reports what the balance gained. */
  function payoutOfOneCoinClick(clicker: ClickerService): number {
    const before = coins(clicker);
    query<HTMLButtonElement>('.clicker__wrapper-main-item').click();
    fixture.detectChanges();
    return round2(coins(clicker) - before);
  }

  beforeEach(() => {
    installFakeStorage();
    TestBed.configureTestingModule({
      declarations: [MainComponent],
      imports: [CommonModule, ClickerModule, StoreModule, AuthModule, HttpClientTestingModule]
    });
  });

  it('pays out exactly what the store button advertises', fakeAsync(() => {
    fixture = TestBed.createComponent(MainComponent);
    const clicker = TestBed.inject(ClickerService);

    // One prestige, so the multiplier is 1.15 and a second application of it
    // would be visible rather than a no-op.
    prestige(clicker);
    setCoins(clicker, 1000);
    fixture.detectChanges();

    const baseline = payoutOfOneCoinClick(clicker);
    tick(1000); // clear the click throttle and retire the popup timer

    query<HTMLButtonElement>('.store__icon-btn').click();
    fixture.detectChanges();

    const strongClick = storeButton('Strong click');
    const advertised = advertisedAmount(strongClick.textContent);
    expect(advertised).toBe(1.15);

    strongClick.click();
    fixture.detectChanges();

    query<HTMLButtonElement>('.store__icon-close').click();
    fixture.detectChanges();

    const upgraded = payoutOfOneCoinClick(clicker);

    // The whole contract in one line: the label is a promise about the balance.
    expect(round2(upgraded - baseline)).toBe(advertised);

    tick(1000);
    discardPeriodicTasks();
  }));

  it('takes the store launcher off the screen while the auth panel is open', fakeAsync(() => {
    fixture = TestBed.createComponent(MainComponent);
    fixture.detectChanges();

    const basket = query<HTMLButtonElement>('.store__icon-btn');
    expect(basket.classList).not.toContain('hidden');
    expect(getComputedStyle(basket).pointerEvents).toBe('auto');

    // Open the *other* panel, from its own launcher.
    query<HTMLButtonElement>('.auth__icon-btn').click();
    fixture.detectChanges();

    // The auth backdrop covers this corner. The basket used to stay painted on
    // top of it: still visible, still in the tab order, and silently swallowing
    // every click because the backdrop took them.
    //
    // pointer-events is the assertion rather than visibility because the
    // stylesheet transitions visibility, so its computed value only settles
    // after the animation — pointer-events flips at once and is the property
    // that decides whether the control is dead.
    expect(basket.classList).toContain('hidden');
    expect(getComputedStyle(basket).pointerEvents).toBe('none');

    discardPeriodicTasks();
  }));
});
