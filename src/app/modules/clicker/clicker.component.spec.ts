import { CommonModule } from '@angular/common';
import { ComponentFixture, discardPeriodicTasks, fakeAsync, TestBed, tick } from '@angular/core/testing';

import { ClickerComponent } from './clicker.component';
import { ClickerService } from 'src/app/core/clicker/clicker.service';
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
