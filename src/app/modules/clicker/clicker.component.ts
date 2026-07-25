import { Component, ElementRef, inject, ViewChild, AfterViewInit } from '@angular/core';
import { Subject, throttleTime, timer } from 'rxjs';
import { ClickerService } from 'src/app/core/clicker/clicker.service';

interface Popup {
  id: number;
  value: number;
  x: number;
  y: number;
}

/** Where the "+n" popup should appear, relative to the coin. */
interface PopupOrigin {
  x: number;
  y: number;
}

@Component({
  selector: 'app-clicker',
  templateUrl: './clicker.component.html',
  styleUrls: ['./clicker.component.scss']
})
export class ClickerComponent implements AfterViewInit {
  clicker = inject(ClickerService)
  popups: Popup[] = [];

  private click$ = new Subject<PopupOrigin>();

  constructor() {
    this.click$
      .pipe(throttleTime(50))
      .subscribe((origin) => this.handleIncrement(origin))
  }

  increment(event: Event) {
    const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();

    // A pointer click carries coordinates; Enter/Space on the button produces a
    // click with detail 0 and no position, so anchor the popup to the centre.
    const pointer = event instanceof MouseEvent && event.detail > 0 ? event : null;
    const clientX = pointer ? pointer.clientX : rect.left + rect.width / 2;
    const clientY = pointer ? pointer.clientY : rect.top + rect.height / 2;

    this.click$.next({ x: clientX - rect.left - 10, y: clientY - rect.top - 20 });
  }

  private handleIncrement({ x, y }: PopupOrigin) {
    this.clicker.increment()

    const coinBonus = parseFloat((this.clicker.coinBonus$.value * this.clicker.ratioGame$.value).toFixed(2))

    const newPopup: Popup = {
      id: Date.now(),
      value: coinBonus,
      x,
      y
    }
    this.popups.push(newPopup);

    timer(1000).subscribe(() => {
      this.popups = this.popups.filter(p => p.id !== newPopup.id);
    });
  }

  @ViewChild('clickItem', { static: true }) clickItem!: ElementRef<HTMLImageElement>;

  ngAfterViewInit() {
    const clickItem = this.clickItem.nativeElement;

    const addActive = () => clickItem.classList.add('active');
    const removeActive = () => clickItem.classList.remove('active');

    clickItem.addEventListener('touchstart', addActive);
    clickItem.addEventListener('touchend', removeActive);

    clickItem.addEventListener('mousedown', addActive);
    clickItem.addEventListener('mouseup', () => setTimeout(removeActive, 100));

    clickItem.addEventListener('mouseleave', removeActive);
  }
}
