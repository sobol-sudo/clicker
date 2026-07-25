import { Component, ElementRef, EventEmitter, Input, Output, ViewChild, AfterViewInit } from '@angular/core';

@Component({
  selector: 'app-button',
  templateUrl: './button.component.html',
  styleUrls: ['./button.component.scss']
})
export class ButtonComponent implements AfterViewInit {
  @Input() type: 'default' | 'danger' = 'default';
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
