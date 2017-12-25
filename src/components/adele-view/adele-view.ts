import { Component,ViewChild } from '@angular/core';


@Component({
  selector: 'AdeleView',
  templateUrl: 'adele-view.html'
})
export class AdeleViewComponent {

  @ViewChild('adeleCanvas') adeleCanvas;

  constructor() {
  }

  ngAfterViewInit(){
    this.adeleCanvas.nativeElement.width  = window.innerWidth;
    this.adeleCanvas.nativeElement.height = window.innerHeight;
    let hammer = new window['Hammer'](this.adeleCanvas.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
    hammer.on('pan', (ev) => {
      let ctx = this.adeleCanvas.nativeElement.getContext('2d');
      ctx.clearRect(0, 0, this.adeleCanvas.nativeElement.width, this.adeleCanvas.nativeElement.height);
      ctx.beginPath();
      ctx.arc(ev.pointers[0].clientX, ev.pointers[0].clientY, 15, 0, 2 * Math.PI, true);
      ctx.fillStyle = 'black';
      ctx.fill();
      console.log(ev);
      
    });

}

}
