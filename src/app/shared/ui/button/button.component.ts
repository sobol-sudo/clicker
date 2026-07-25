import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit {
  /**
   * Look only. It used to be written straight into the native `type`
   * attribute, which produced `<button type="default">` — not a value the HTML
   * spec knows, so every browser fell back to the submit state. The two
   * form buttons in the app were therefore submitting by accident rather than
   * by instruction, and correcting the attribute to `button` would have
   * silently killed sign-in and sign-up. The variant now travels as a data
   * attribute and the real type is stated separately.
   */
  @Input() type: 'default' | 'danger' = 'default';

  /** The actual HTML button type. Only a form's submit button needs 'submit'. */
  @Input() nativeType: 'button' | 'submit' = 'button';

  @Input() disabled = false;
  @Output() btnClick = new EventEmitter<Event>();

  @ViewChild('button', { static: true }) btn!: ElementRef<HTMLButtonElement>;

  /**
   * `click` is the only event that emits. It fires exactly once per tap — a
   * touch and the compatibility mouse event the browser sends after it
   * collapse into a single click — and it also fires for Enter/Space, so the
   * control works from the keyboard.
   */
  onClick(event: Event) {
    if (this.disabled) return;

    this.btn.nativeElement.classList.remove('active');
    this.btnClick.emit(event);
  }

  /** Pointer listeners only drive the pressed-state class. */
  ngAfterViewInit() {
    const button = this.btn.nativeElement;

    const addActive = () => button.classList.add('active');
    const removeActive = () => button.classList.remove('active');

    button.addEventListener('touchstart', addActive);
    button.addEventListener('touchend', removeActive);

    button.addEventListener('mousedown', addActive);
    button.addEventListener('mouseup', () => setTimeout(removeActive, 100));

    button.addEventListener('mouseleave', removeActive);
  }
}
