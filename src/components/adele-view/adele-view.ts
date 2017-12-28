import { Component,ViewChild } from '@angular/core';

import { Comando } from './comando';

@Component({
  selector: 'AdeleView',
  templateUrl: 'adele-view.html'
})
export class AdeleViewComponent {

  @ViewChild('adeleCanvas') private adeleCanvas;

  private logo:Comando;
  private play:Comando;
  private erase:Comando;

  private comandos:Array<Comando>;
  private programa:Array<Comando>;

  constructor() {
    this.comandos = new Array<Comando>();
    this.programa = new Array<Comando>();
  }

  ngAfterViewInit(){
    let ctx = this.adeleCanvas.nativeElement.getContext('2d');
    
    this.configCanvas(ctx);

    this.initComandos(ctx);
    
  }

  configCanvas(ctx:CanvasRenderingContext2D):void {
    this.adeleCanvas.nativeElement.width  = window.innerWidth;
    this.adeleCanvas.nativeElement.height = window.innerHeight;
    
    let c:Comando = null;
    let hammer = new window['Hammer'](this.adeleCanvas.nativeElement);
    
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });
    hammer.on('panstart',(ev)=>{
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      console.info("Inicialdo toque",x,y);

      for (let i=0;i<this.comandos.length && c==null;++i) {
        if(this.comandos[i].estaDentro([x,y])){
          c = this.comandos[i].clone();
          this.programa.push(c);
        }
      }
      for (let i=0;i<this.programa.length && c==null;++i) {
        if(this.programa[i].estaDentro([x,y])){
          c = this.programa[i];
        }
      }
    });
    hammer.on('pan', (ev) => {

      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      
      if(c!=null){
        ctx.clearRect(0, 0, this.adeleCanvas.nativeElement.width, this.adeleCanvas.nativeElement.height);
        c.setPosicion([x,y]);
        this.logo.dibujar();
        for (let i=0;i<this.comandos.length;++i) {
          this.comandos[i].dibujar();
        }
        for (let i=0;i<this.programa.length;++i) {
          this.programa[i].dibujar();
          if(i<(this.programa.length-1)){
            let p0 = this.programa[i].getPosicion();
            let p1 = this.programa[i+1].getPosicion();
            ctx.fillStyle = "black";
            ctx.beginPath();
            ctx.moveTo(p0[0],p0[1]);
            
            let k:number = (i%2==0) ? -1 : 2;
            k = k*p1[1];
            console.log(i,k);
            ctx.quadraticCurveTo(
              (p0[0]+p1[0])/2,
              (p0[1]+k)/2,
              p1[0],
              p1[1]
            );
            ctx.stroke();
          }
        }
      }
      if(ev.isFinal){
        console.info("Terminando toque: ",x,y);
        c=null;
      }
    });
  }

  initComandos(ctx:CanvasRenderingContext2D):void {
    this.logo = new Comando(ctx,"","assets/adele/adeleLogo.png",true);
    this.logo.setPosicion([55,window.innerHeight-20]);
    
    this.play = new Comando(ctx,"play","assets/adele/play.png",true);
    this.play.setTamanio([30,30]);
    this.play.setPosicion([window.innerWidth-40,30]);
    
    this.erase = new Comando(ctx,"erase","assets/adele/erase.png",true);
    this.erase.setTamanio([30,30]);
    this.erase.setPosicion([window.innerWidth-40,window.innerHeight-20]);
    

    //botones
    let temp= new Comando(ctx,"u","assets/adele/arrowU.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([140,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"d","assets/adele/arrowD.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([180,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"l","assets/adele/arrowL.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([220,30]);
    this.comandos.push(temp);


    temp= new Comando(ctx,"r","assets/adele/arrowR.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([260,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"c","assets/adele/clawC.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([300,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"o","assets/adele/clawO.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([340,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"q","assets/adele/color.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([380,30]);
    this.comandos.push(temp);

    temp= new Comando(ctx,"q","assets/adele/note.png",true);
    temp.setTamanio([30,30]);
    temp.setPosicion([420,30]);
    this.comandos.push(temp);

  }

}
