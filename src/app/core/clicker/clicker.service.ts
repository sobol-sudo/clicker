import { Injectable } from '@angular/core';
import { BehaviorSubject, interval, } from 'rxjs';

/**
 * The only place a starting value is written down. Field initializers,
 * initSaveData() and resetProgress() all read from here so the three can never
 * drift apart again.
 */
const INITIAL = {
  myCoins: 0,
  coinBonus: 1,
  autoBonus: 0,
  priceStrongClick: 12,
  priceAutoClick: 30,
  ratioGame: 1,
  resetGamePrice: 5000
} as const;

/** Auto-click income ticks once per second, which is what the UI claims. */
const AUTO_CLICK_INTERVAL_MS = 1000;
const AUTO_SAVE_INTERVAL_MS = 5000;

@Injectable({
  providedIn: 'root'
})
export class ClickerService {
  private _myCoins = new BehaviorSubject<number>(INITIAL.myCoins);
  private _coinBonus = new BehaviorSubject<number>(INITIAL.coinBonus);
  private _autoBonus = new BehaviorSubject<number>(INITIAL.autoBonus)
  private _priceStrongClick = new BehaviorSubject<number>(INITIAL.priceStrongClick);
  private _priceAutoClick = new BehaviorSubject<number>(INITIAL.priceAutoClick)
  private _ratioGame = new BehaviorSubject<number>(INITIAL.ratioGame)
  private _resetGamePrice = new BehaviorSubject<number>(INITIAL.resetGamePrice)

  myCoins$ = this._myCoins.asObservable();
  coinBonus$ = this._coinBonus;
  autoBonus$ = this._autoBonus;
  priceStrongClick$ = this._priceStrongClick.asObservable();
  priceAutoClick$ = this._priceAutoClick;
  ratioGame$ = this._ratioGame
  resetGamePrice$ = this._resetGamePrice

  constructor() {
    this.startAutoSave()
    this.initSaveData()

    interval(AUTO_CLICK_INTERVAL_MS).subscribe(() => this.autoClick())
  }

  autoClick() {
    const autoIncome = this._autoBonus.value * this._ratioGame.value;
    this._myCoins.next((parseFloat((this._myCoins.value + autoIncome).toFixed(2))))
  }

  private initSaveData() {
    const get = (key: string, fallback: number) =>
      +(localStorage.getItem(key) || fallback);

    this._myCoins.next(get('myCoins', INITIAL.myCoins));
    this._coinBonus.next(get('coinBonus', INITIAL.coinBonus));
    this._autoBonus.next(get('autoBonus', INITIAL.autoBonus));
    this._priceStrongClick.next(get('priceStrongClick', INITIAL.priceStrongClick));
    this._priceAutoClick.next(get('priceAutoClick', INITIAL.priceAutoClick));
    this._ratioGame.next(get('ratioGame', INITIAL.ratioGame));
    this._resetGamePrice.next(get('resetGamePrice', INITIAL.resetGamePrice))
  }

  private startAutoSave() {
    interval(AUTO_SAVE_INTERVAL_MS).subscribe(() => this.saveProgress())
  }

  saveProgress() {
    localStorage.setItem('myCoins', this._myCoins.value.toString());
    localStorage.setItem('coinBonus', this._coinBonus.value.toString());
    localStorage.setItem('autoBonus', this._autoBonus.value.toString());
    localStorage.setItem('priceStrongClick', this._priceStrongClick.value.toString());
    localStorage.setItem('priceAutoClick', this._priceAutoClick.value.toString());
    localStorage.setItem('ratioGame', this._ratioGame.value.toString());
    localStorage.setItem('resetGamePrice', this._resetGamePrice.value.toString());
  }

  increment() {
    const incrementValue = this._coinBonus.value * this._ratioGame.value;
    const newTotal = this._myCoins.value + incrementValue;

    this._myCoins.next(parseFloat(newTotal.toFixed(2)));
  }

  buyStrongClick() {
    if (this._myCoins.value >= this._priceStrongClick.value) {
      this._myCoins.next(parseFloat((this._myCoins.value - this._priceStrongClick.value).toFixed(2)));
      this._coinBonus.next(parseFloat((this._coinBonus.value + 1 * this._ratioGame.value).toFixed(2)));
      this._priceStrongClick.next(Math.floor(this._priceStrongClick.value * 1.15));
    }
  }

  buyAutoClick() {
    if (this._myCoins.value >= this._priceAutoClick.value) {
      this._myCoins.next(parseFloat((this._myCoins.value - this._priceAutoClick.value).toFixed(2)));
      this._autoBonus.next(parseFloat((this._autoBonus.value + 1 * this._ratioGame.value).toFixed(2)));
      this._priceAutoClick.next(Math.floor(this._priceAutoClick.value * 1.1));
    }
  }

  resetProgress() {
    if (this._resetGamePrice.value > this._myCoins.value) return
    this._myCoins.next(INITIAL.myCoins);
    this._autoBonus.next(INITIAL.autoBonus);
    this._coinBonus.next(INITIAL.coinBonus)
    this._priceStrongClick.next(INITIAL.priceStrongClick);
    this._priceAutoClick.next(INITIAL.priceAutoClick);

    // The prestige price and the multiplier are the two things that carry over.
    this._resetGamePrice.next(Math.floor(this._resetGamePrice.value * 2.5))
    this._ratioGame.next(Number((this._ratioGame.value * 1.15).toFixed(2)));

    this.saveProgress()
  }
}
