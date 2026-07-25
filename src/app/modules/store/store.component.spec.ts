import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed } from '@angular/core/testing';

import {StoreComponent } from './store.component';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'src/app/shared/ui/button/button.module';
import { ClickerService } from 'src/app/core/clicker/clicker.service';
import { installFakeStorage, latest, setCoins } from 'src/app/testing/test-utils';

describe('StoreComponent', () => {
  let component: StoreComponent;
  let fixture: ComponentFixture<StoreComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [StoreComponent],
      imports: [CommonModule, ButtonModule]
    });
    fixture = TestBed.createComponent(StoreComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

/**
 * The store decides on its own whether a purchase looks affordable, and the
 * service decides on its own whether it goes through. Nothing links the two
 * comparisons, so any price they disagree at is a price where the player meets
 * a control that lies: live but inert, or dead but affordable. That boundary is
 * the whole of each price, so these drive the rendered buttons at it rather
 * than reading the predicate that feeds them.
 */
describe('StoreComponent at the exact price of each purchase', () => {
  let fixture: ComponentFixture<StoreComponent>;
  let clicker: ClickerService;

  /** The three purchases, each with its price and the number it moves. */
  function purchases() {
    return [
      {
        label: 'Strong click',
        price: latest(clicker.priceStrongClick$),
        outcome: () => latest(clicker.coinBonus$)
      },
      {
        label: 'Auto click',
        price: latest(clicker.priceAutoClick$),
        outcome: () => latest(clicker.autoBonus$)
      },
      {
        label: 'Reset',
        price: latest(clicker.resetGamePrice$),
        outcome: () => latest(clicker.ratioGame$)
      }
    ];
  }

  function button(label: string): HTMLButtonElement {
    const found = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>(
        '.store__content button.btn'
      )
    ).find(candidate => candidate.textContent?.includes(label));

    expect(found).withContext(`missing store button "${label}"`).toBeDefined();
    return found as HTMLButtonElement;
  }

  beforeEach(() => {
    installFakeStorage();
    TestBed.configureTestingModule({
      declarations: [StoreComponent],
      imports: [CommonModule, ButtonModule]
    });
    clicker = TestBed.inject(ClickerService);
    fixture = TestBed.createComponent(StoreComponent);
  });

  it('offers a purchase the player can exactly afford, and completes it when clicked', fakeAsync(() => {
    for (const { label, price, outcome } of purchases()) {
      setCoins(clicker, price);
      fixture.detectChanges();

      const control = button(label);
      expect(control.disabled).withContext(`"${label}" at exactly ${price}`).toBe(false);

      const before = outcome();
      control.click();
      fixture.detectChanges();

      // The click has to land, not merely be permitted: an enabled button whose
      // purchase the service then refuses is a dead control in disguise.
      expect(outcome())
        .withContext(`"${label}" clicked with exactly ${price}`)
        .toBeGreaterThan(before);
      expect(latest(clicker.myCoins$))
        .withContext(`"${label}" charged the player`)
        .toBeLessThan(price);
    }

    discardPeriodicTasks();
  }));

  it('refuses a purchase one coin short, and the button says so before it is clicked', fakeAsync(() => {
    for (const { label, price, outcome } of purchases()) {
      setCoins(clicker, price - 1);
      fixture.detectChanges();

      const control = button(label);
      expect(control.disabled).withContext(`"${label}" one coin short of ${price}`).toBe(true);

      const before = outcome();
      control.click();
      fixture.detectChanges();

      expect(outcome()).withContext(`"${label}" stayed unbought`).toBe(before);
      expect(latest(clicker.myCoins$)).withContext('balance untouched').toBe(price - 1);
    }

    discardPeriodicTasks();
  }));
});
