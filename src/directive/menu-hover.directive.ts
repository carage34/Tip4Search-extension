import {Directive, ElementRef, HostListener, Renderer2} from '@angular/core';

@Directive({
  selector: '[appMenuHover]'
})
export class MenuHoverDirective {

  constructor(private el: ElementRef, private renderer: Renderer2) {

  }

  @HostListener('click') onClick() {
    if(this.el.nativeElement.classList.contains('vod')) {
      Array.from(document.getElementsByClassName('hr2') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('active');
      document.getElementsByClassName('hr1')[0].classList.add('active');
      document.getElementsByClassName('search')[0].classList.remove('active');
      document.getElementsByClassName('vod')[0].classList.add('active');
    }

    if(this.el.nativeElement.classList.contains('search')) {
      Array.from(document.getElementsByClassName('hr1') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('active');
      document.getElementsByClassName('hr2')[0].classList.add('active');
      document.getElementsByClassName('vod')[0].classList.remove('active');
      document.getElementsByClassName('search')[0].classList.add('active');
    }
  }

  @HostListener('mouseover') onHover() {
    if(this.el.nativeElement.classList.contains('vod')) {
      document.getElementsByClassName('hr1')[0].classList.add('active');
    }
    if(this.el.nativeElement.classList.contains('search')) {
      document.getElementsByClassName('hr2')[0].classList.add('active');
    }
  }

  @HostListener('mouseout') onLeave() {
    if(this.el.nativeElement.classList.contains('vod') && !this.el.nativeElement.classList.contains('active')) {
      Array.from(document.getElementsByClassName('hr1') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('active');
    }
    if(this.el.nativeElement.classList.contains('search') && !this.el.nativeElement.classList.contains('active')) {
      Array.from(document.getElementsByClassName('hr2') as HTMLCollectionOf<HTMLElement>)[0].classList.remove('active');
    }
  }
}
