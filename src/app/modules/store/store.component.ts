import { Component, inject } from '@angular/core';
import { combineLatest, map, Observable } from 'rxjs';
import { ClickerService } from 'src/app/core/clicker/clicker.service';
import { OverlayService } from 'src/app/core/ui/overlay.service';

@Component({
  selector: 'app-store',
  templateUrl: './store.component.html',
  styleUrls: ['./store.component.scss']
})
export class StoreComponent {
  private overlay = inject(OverlayService);
  clicker = inject(ClickerService)

  isOpenStore$ = this.overlay.isOpen$('store');

  /**
   * The basket hides behind any open panel, not just its own — otherwise it
   * sits on top of the auth backdrop looking clickable and doing nothing.
   */
  isLauncherHidden$ = this.overlay.anyOpen$;

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
    this.overlay.toggle('store')
  }

  private canAfford(price$: Observable<number>): Observable<boolean> {
    return combineLatest([this.clicker.myCoins$, price$]).pipe(
      map(([coins, price]) => coins >= price)
    );
  }
}
