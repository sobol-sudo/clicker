import { Component, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ClickerService } from 'src/app/core/clicker/clicker.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent {
  isOpenStore = false;
  clicker = inject(ClickerService)

  /** Drives the disabled state so an unaffordable purchase never looks live. */
  canBuyStrongClick$ = this.canAfford(this.clicker.priceStrongClick$);
  canBuyAutoClick$ = this.canAfford(this.clicker.priceAutoClick$);
  canResetProgress$ = this.canAfford(this.clicker.resetGamePrice$);

  buyStrongClick() {
    this.clicker.buyStrongClick()
  }
  buyAutoClick() {
    this.clicker.buyAutoClick()
  }

  resetProgress() {
    this.clicker.resetProgress()
  }

  toggleStore() {
    this.isOpenStore = !this.isOpenStore
  }

  private canAfford(price$: Observable<number>): Observable<boolean> {
    return combineLatest([this.clicker.myCoins$, price$]).pipe(
      map(([coins, price]) => coins >= price)
    );
  }
}
