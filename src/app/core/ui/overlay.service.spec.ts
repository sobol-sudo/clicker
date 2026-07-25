import { TestBed } from '@angular/core/testing';
import { OverlayId, OverlayService } from './overlay.service';

/** Reads the current value off the stream without leaving a subscription open. */
function currentOverlay(overlay: OverlayService): OverlayId | null {
  let open: OverlayId | null = null;
  overlay.open$.subscribe(value => (open = value)).unsubscribe();
  return open;
}

function anyOpen(overlay: OverlayService): boolean {
  let open = false;
  overlay.anyOpen$.subscribe(value => (open = value)).unsubscribe();
  return open;
}

describe('OverlayService', () => {
  let overlay: OverlayService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    overlay = TestBed.inject(OverlayService);
  });

  it('keeps one panel open at a time and closes the open one when it is toggled again', () => {
    expect(currentOverlay(overlay)).toBeNull();

    overlay.toggle('auth');
    expect(currentOverlay(overlay)).toBe('auth');

    // Opening the other panel has to close this one: both cover the whole
    // viewport, so two open at once means one of them is unreachable.
    overlay.toggle('store');
    expect(currentOverlay(overlay)).toBe('store');

    overlay.toggle('store');
    expect(currentOverlay(overlay)).toBeNull();
  });

  it('reports a panel as open whichever one it is', () => {
    // anyOpen$ is the cue every launcher uses to leave the screen. If it only
    // tracked its own panel, the other panel's launcher would stay painted on
    // top of the backdrop looking live while swallowing every click — the bug
    // this service exists to prevent.
    expect(anyOpen(overlay)).toBeFalse();

    overlay.toggle('auth');
    expect(anyOpen(overlay)).toBeTrue();

    overlay.toggle('store');
    expect(anyOpen(overlay)).toBeTrue();

    overlay.close();
    expect(anyOpen(overlay)).toBeFalse();
  });
});
