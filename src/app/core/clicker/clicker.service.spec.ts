import { TestBed } from '@angular/core/testing';
import { ClickerService } from './clicker.service';

describe('ClickerService', () => {
  let service: ClickerService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ClickerService);

    const store: Record<string, string> = {};
    spyOn(localStorage, 'getItem').and.callFake((key: string) => store[key] || null);
    spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => store[key] = value);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('increment should increase the coin count', () => {
    let coins = 0;
    service.myCoins$.subscribe(val => coins = val)

    service.increment();
    expect(coins).toBeGreaterThan(0)
  })

  it('buyStrongClick should deduct coins and increase the bonus when there are enough coins', () => {
    (service as any)._myCoins.next(100);
    const oldBonus = (service as any)._coinBonus.value;

    service.buyStrongClick();

    expect((service as any)._myCoins.value).toBeLessThan(100);
    expect((service as any)._coinBonus.value).toBeGreaterThan(oldBonus);
  })

  it('buyAutoClick should increase the auto bonus', () => {
    (service as any)._myCoins.next(100);
    const oldAutoBonus = (service as any)._autoBonus.value

    service.buyAutoClick();

    expect((service as any)._myCoins.value).toBeLessThan(100);
    expect((service as any)._autoBonus.value).toBeGreaterThan(oldAutoBonus)
  })

  it('resetProgress should reset progress and increase ratioGame when the balance is sufficient', () => {
    (service as any)._myCoins.next(6000);
    (service as any)._resetGamePrice.next(5000);
    const oldRatio = (service as any)._ratioGame.value

    service.resetProgress();

    expect((service as any)._myCoins.value).toBe(0);
    expect((service as any)._ratioGame.value).toBeGreaterThan(oldRatio);
  })

  it('resetProgress should restore the shop to its starting prices, not swap them', () => {
    const startingStrongClick = (service as any)._priceStrongClick.value;
    const startingAutoClick = (service as any)._priceAutoClick.value;

    // Move both prices off their starting values first, so the assertion below
    // cannot pass by accident.
    (service as any)._myCoins.next(1000);
    service.buyStrongClick();
    service.buyAutoClick();
    expect((service as any)._priceStrongClick.value).not.toBe(startingStrongClick);
    expect((service as any)._priceAutoClick.value).not.toBe(startingAutoClick);

    (service as any)._myCoins.next(6000);
    (service as any)._resetGamePrice.next(5000);

    service.resetProgress();

    expect((service as any)._priceStrongClick.value).toBe(startingStrongClick);
    expect((service as any)._priceAutoClick.value).toBe(startingAutoClick);
    expect((service as any)._coinBonus.value).toBe(1);
    expect((service as any)._autoBonus.value).toBe(0);
  })

  it('resetProgress should not reset progress or increase ratioGame when the balance is insufficient', () => {
    (service as any)._myCoins.next(4000);
    (service as any)._resetGamePrice.next(5000);
    const oldRatio = (service as any)._ratioGame.value

    service.resetProgress();

    expect((service as any)._myCoins.value).toBe(4000);
    expect((service as any)._ratioGame.value).toBe(oldRatio)
  })

  // This bug has come back twice. Lock the contract: whatever the store
  // advertises for an upgrade is exactly what the balance goes up by.
  it('after a prestige an upgrade should pay out exactly the advertised amount', () => {
    (service as any)._myCoins.next(6000);
    (service as any)._resetGamePrice.next(5000);
    service.resetProgress();

    const advertised = (service as any)._ratioGame.value;
    expect(advertised).toBe(1.15);

    // Manual click: the marginal gain from one Strong click purchase.
    const before = service.increment();
    (service as any)._myCoins.next(1000);
    service.buyStrongClick();
    const after = service.increment();

    expect(parseFloat((after - before).toFixed(2))).toBe(advertised);

    // Auto click: the printed "clicks per second" is the real per-second credit.
    (service as any)._myCoins.next(1000);
    service.buyAutoClick();
    const printedRate = (service as any)._autoBonus.value;
    const balanceBeforeTick = (service as any)._myCoins.value;
    service.autoClick();

    expect(parseFloat(((service as any)._myCoins.value - balanceBeforeTick).toFixed(2)))
      .toBe(printedRate);
  })

  it('saveProgress should call setItem on localStorage', () => {
    service.saveProgress();
    expect(localStorage.setItem).toHaveBeenCalled();
  })

  it('autoClick should credit the per-second rate without re-applying ratioGame', () => {
    (service as any)._myCoins.next(0);
    (service as any)._autoBonus.next(2);
    // autoBonus already had the multiplier banked into it at purchase time, so
    // a large ratioGame must not inflate the payout a second time.
    (service as any)._ratioGame.next(2);
    service.autoClick();

    expect((service as any)._myCoins.value).toBe(2)
  })
});
