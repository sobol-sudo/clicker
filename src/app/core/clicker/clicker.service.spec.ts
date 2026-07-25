import { discardPeriodicTasks, fakeAsync, TestBed } from '@angular/core/testing';
import { ClickerService } from './clicker.service';
import {
  coins,
  installFakeStorage,
  prestige,
  progressSnapshot,
  round2,
  setCoins
} from 'src/app/testing/test-utils';

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

/**
 * The prestige multiplier is the one number in the game that compounds, carries
 * across a wipe and gets written into the save. Each spec below builds its own
 * service inside fakeAsync so the two background intervals are fake timers that
 * discardPeriodicTasks() disposes of — no spec leaves a clock running or a key
 * in the browser's real localStorage.
 */
describe('ClickerService prestige arithmetic', () => {
  it('compounds the prestige multiplier on every wipe instead of adding a flat step', fakeAsync(() => {
    installFakeStorage();
    const service = new ClickerService();

    const advertised: number[] = [];
    for (let i = 0; i < 3; i++) {
      prestige(service);
      advertised.push(service.ratioGame$.value);
    }

    // A flat "+0.15" step is indistinguishable from x1.15 after a single
    // prestige — both land on 1.15 — which is why this walks three of them.
    expect(advertised).toEqual([1.15, 1.32, 1.52]);

    discardPeriodicTasks();
  }));

  it('compounds the prestige price and never wipes it along with the progress it buys', fakeAsync(() => {
    installFakeStorage();
    const service = new ClickerService();

    const prices = [service.resetGamePrice$.value];
    for (let i = 0; i < 2; i++) {
      prestige(service);
      prices.push(service.resetGamePrice$.value);
    }

    // The price and the multiplier are the only two things that survive a wipe.
    // Resetting either one to its starting value makes prestige free forever.
    expect(prices).toEqual([5000, 12500, 31250]);
    expect(service.ratioGame$.value).toBe(1.32);

    discardPeriodicTasks();
  }));

  it('loads a save as finished rates rather than raw upgrade counts', fakeAsync(() => {
    // Exactly what saveProgress() writes after one prestige and one of each
    // upgrade. The multiplier is already banked into the two rates, so they
    // have to be credited verbatim — reading them as counts and multiplying at
    // earn time would silently inflate every save already in the wild.
    installFakeStorage({
      myCoins: '100',
      coinBonus: '2.15',
      autoBonus: '1.15',
      priceStrongClick: '13',
      priceAutoClick: '33',
      ratioGame: '1.15',
      resetGamePrice: '12500'
    });

    const service = new ClickerService();

    expect(service.increment()).toBe(2.15);

    const before = coins(service);
    service.autoClick();
    expect(round2(coins(service) - before)).toBe(1.15);

    discardPeriodicTasks();
  }));

  /**
   * The multiplier is banked into a rate once per upgrade, so the rate is a
   * running sum: N upgrades after a prestige are worth N x the advertised
   * amount, no more. Multiplying the rate by the multiplier instead of adding
   * to it, or letting the multiplier itself grow per purchase, curves this
   * ladder — and a single purchase is too short a run to show the curve.
   */
  it('pays the advertised amount once per upgrade, so three upgrades are worth three of them', fakeAsync(() => {
    installFakeStorage();
    const service = new ClickerService();

    prestige(service);
    const advertised = service.ratioGame$.value;
    expect(advertised).toBe(1.15);

    const clickRate: number[] = [];
    const autoRate: number[] = [];
    for (let i = 0; i < 3; i++) {
      setCoins(service, 1000);
      service.buyStrongClick();
      service.buyAutoClick();
      clickRate.push(service.coinBonus$.value);
      autoRate.push(service.autoBonus$.value);
    }

    // Starting from 1 coin per click and 0 per second, plus 1.15 each time.
    expect(clickRate).toEqual([2.15, 3.3, 4.45]);
    expect(autoRate).toEqual([1.15, 2.3, 3.45]);

    // And the two earning paths pay the finished rates, not a recomputation.
    setCoins(service, 0);
    expect(service.increment()).toBe(4.45);
    service.autoClick();
    expect(coins(service)).toBe(round2(4.45 + 3.45));

    discardPeriodicTasks();
  }));
});

/**
 * A prestige run is hours of play, and it only survives because saveProgress()
 * and initSaveData() name the same seven keys. The specs above seed storage by
 * hand, so they would all still pass if the save stopped writing one of them —
 * the reload is the half nobody was watching.
 */
describe('ClickerService save round trip', () => {
  it('reloads a prestiged save as the same game, paying the same amounts', fakeAsync(() => {
    installFakeStorage();
    const session = new ClickerService();

    prestige(session);
    prestige(session);
    setCoins(session, 1000);
    session.buyStrongClick();
    session.buyAutoClick();
    session.saveProgress();

    const before = progressSnapshot(session);
    expect(before).toEqual({
      myCoins: 958,
      coinBonus: 2.32,
      autoBonus: 1.32,
      priceStrongClick: 13,
      priceAutoClick: 33,
      ratioGame: 1.32,
      resetGamePrice: 31250
    });

    // Same storage, a brand new service: exactly what reopening the tab does.
    const reloaded = new ClickerService();

    expect(progressSnapshot(reloaded)).toEqual(before);

    // Dropping any one key from the save would silently hand back a starting
    // value here, so assert on the payouts a player would notice: the rates
    // they bought, and the multiplier the next upgrade is priced in.
    expect(reloaded.increment()).toBe(2.32);

    const balance = coins(reloaded);
    reloaded.autoClick();
    expect(round2(coins(reloaded) - balance)).toBe(1.32);

    setCoins(reloaded, 1000);
    const rateBeforeUpgrade = reloaded.coinBonus$.value;
    reloaded.buyStrongClick();
    expect(round2(reloaded.coinBonus$.value - rateBeforeUpgrade)).toBe(1.32);

    discardPeriodicTasks();
  }));
});
