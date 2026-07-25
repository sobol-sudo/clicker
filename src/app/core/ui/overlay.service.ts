import { Injectable } from '@angular/core';
import { BehaviorSubject, distinctUntilChanged, map, Observable } from 'rxjs';

export type OverlayId = 'auth' | 'store';

/**
 * Tracks which full-screen panel is open, because the store and the auth panel
 * each cover the whole viewport.
 *
 * Both panels used to track their own open flag and hide only their own
 * launcher. The launcher belonging to the *other* panel stayed painted on top
 * of the backdrop, so it still looked live while the open overlay quietly
 * swallowed every click on it. Routing both through one place keeps two rules
 * true at once: only one panel can be open, and while one is open no control
 * behind it is left on screen pretending to work.
 */
@Injectable({ providedIn: 'root' })
export class OverlayService {
  private _open = new BehaviorSubject<OverlayId | null>(null);

  readonly open$ = this._open.asObservable();

  /** True while any panel is up — the cue for launchers to leave the screen. */
  readonly anyOpen$: Observable<boolean> = this.open$.pipe(
    map(open => open !== null),
    distinctUntilChanged()
  );

  isOpen$(id: OverlayId): Observable<boolean> {
    return this.open$.pipe(
      map(open => open === id),
      distinctUntilChanged()
    );
  }

  /** Opens `id`, or closes it if it is already the open one. */
  toggle(id: OverlayId): void {
    this._open.next(this._open.value === id ? null : id);
  }

  close(): void {
    this._open.next(null);
  }
}
