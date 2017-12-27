import { Component,ViewChild } from '@angular/core';

import { Comando } from './comando';

@Component({
  selector: 'AdeleView',
  templateUrl: 'adele-view.html'
})
export class AdeleViewComponent {

  @ViewChild('adeleCanvas') private adeleCanvas;

  private logo:Comando;
  private arriba:Comando;
  

  constructor() {
    
  }

  ngAfterViewInit(){
    let ctx = this.adeleCanvas.nativeElement.getContext('2d');
    
    


    this.arriba = new Comando(ctx,"a","assets/adele/arrowU.png");
    this.arriba.setTamanio([10,20]);
    
    this.adeleCanvas.nativeElement.width  = window.innerWidth;
    this.adeleCanvas.nativeElement.height = window.innerHeight;

    this.logo = new Comando(ctx,"","assets/adele/adeleLogo.png",true);
    this.logo.setPosicion([55,window.innerHeight-20]);
    
    let hammer = new window['Hammer'](this.adeleCanvas.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
    hammer.on('pan', (ev) => {
      
      ctx.clearRect(0, 0, this.adeleCanvas.nativeElement.width, this.adeleCanvas.nativeElement.height);

      this.logo.dibujar();

      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;

      this.arriba.setPosicion([x,y]);
      this.arriba.dibujar();
      
      console.log(ev);
      
    });
  }


}
