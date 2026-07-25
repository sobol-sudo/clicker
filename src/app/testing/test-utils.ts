import { BehaviorSubject } from 'rxjs';
import { ClickerService } from '../core/clicker/clicker.service';

/**
 * Helpers shared by the specs. Nothing here is imported by application code, so
 * it never reaches the bundle.
 */

/** Two decimals is the precision the game rounds every balance to. */
export function round2(value: number): number {
  return parseFloat(value.toFixed(2));
}

/**
 * Swaps localStorage for an in-memory object for the length of one spec.
 * Jasmine removes the spies afterwards, so a spec can neither read the
 * browser's real save nor leave one behind.
 *
 * Install this BEFORE the service under test is constructed — ClickerService
 * loads its save in the constructor.
 */
export function installFakeStorage(seed: Record<string, string> = {}): Record<string, string> {
  const store: Record<string, string> = { ...seed };

  spyOn(localStorage, 'getItem').and.callFake((key: string) => (key in store ? store[key] : null));
  spyOn(localStorage, 'setItem').and.callFake((key: string, value: string) => {
    store[key] = value;
  });
  spyOn(localStorage, 'removeItem').and.callFake((key: string) => {
    delete store[key];
  });

  return store;
}

/** The balance is published read-only; specs need to stage it directly. */
export function setCoins(service: ClickerService, value: number): void {
  (service as unknown as { _myCoins: BehaviorSubject<number> })._myCoins.next(value);
}

/** Reads the current balance off the public stream. */
export function coins(service: ClickerService): number {
  let value = 0;
  service.myCoins$.subscribe(current => (value = current)).unsubscribe();
  return value;
}

/** Buys one prestige at whatever it currently costs. */
export function prestige(service: ClickerService): void {
  setCoins(service, service.resetGamePrice$.value);
  service.resetProgress();
}

/**
 * Pulls the figure a store button advertises out of its label, e.g.
 * "Strong click + 1.15 12" -> 1.15. Deliberately reads the rendered text
 * rather than the component field: the point is to compare what the player is
 * promised against what they are paid.
 */
export function advertisedAmount(label: string | null): number {
  const match = /\+\s*([\d.]+)/.exec(label ?? '');
  return match ? parseFloat(match[1]) : NaN;
}
