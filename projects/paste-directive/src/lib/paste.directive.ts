import { Directive, ElementRef, Renderer2, inject, output } from '@angular/core';

@Directive({
  selector: '[paste]',
  standalone: true
})
export class PasteDirective {
  public pastedEvent = output();
  private textCaretPosition!: Selection;
  private removeBlurListener!: () => void;
  private removePasteListener!: () => void;
  private removeFocusListener!: () => void;
  private removeKeydownListener!: () => void;
  private removeMouseupListener!: () => void;
  private el: ElementRef = inject(ElementRef);
  private removeMouseDownListener!: () => void;
  private renderer: Renderer2 = inject(Renderer2);


  private ngOnInit(): void {
    this.setFocusListener();
  }



  private setFocusListener(): void {
    this.removeFocusListener = this.renderer.listen(this.el.nativeElement, 'focus', () => {
      this.setBlurListener();
      this.getTextCaretPosition()
      this.removePasteListener = this.renderer.listen(this.el.nativeElement, 'paste', (e: ClipboardEvent) => this.onPaste(e));
      this.removeKeydownListener = this.renderer.listen(this.el.nativeElement, 'keydown', () => this.getTextCaretPosition());
      this.removeMouseupListener = this.renderer.listen(this.el.nativeElement, 'mouseup', () => this.getTextCaretPosition());
      this.removeMouseDownListener = this.renderer.listen(this.el.nativeElement, 'mousedown', () => this.getTextCaretPosition());
    })
  }



  private setBlurListener(): void {
    this.removeBlurListener = this.renderer.listen(this.el.nativeElement, 'blur', () => {
      this.removeBlurListener();
      this.removePasteListener();
      this.removeKeydownListener();
      this.removeMouseupListener();
      this.removeMouseDownListener();
    })
  }



  private getTextCaretPosition(): void {
    setTimeout(() => {
      this.textCaretPosition = window.getSelection()!;
    });
  }



  private onPaste(e: ClipboardEvent): void {
    e.preventDefault();
    const clipboardData = e.clipboardData?.getData('text/plain').trim();
    if (!clipboardData) return;
    const caretOffset = this.textCaretPosition.anchorOffset;
    const updatedTextContent = this.el.nativeElement.textContent.slice(0, caretOffset) + clipboardData + this.el.nativeElement.textContent.slice(this.textCaretPosition.focusOffset);
    this.el.nativeElement.textContent = updatedTextContent;
    const range = document.createRange();
    range.setStart(this.el.nativeElement.firstChild, caretOffset + clipboardData.length);
    const sel = window.getSelection();
    if (sel) {
      sel.removeAllRanges();
      sel.addRange(range);
    }
    this.pastedEvent.emit();
  }



  private ngOnDestroy(): void {
    this.removeFocusListener();
  }
}