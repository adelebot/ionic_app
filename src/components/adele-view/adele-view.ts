import { Component,ViewChild,Output,EventEmitter,NgZone } from '@angular/core';

import { Comando } from './comando';

@Component({
  selector: 'AdeleView',
  templateUrl: 'adele-view.html'
})
export class AdeleViewComponent {

  // Canvas sobre el que se trabaja
  @ViewChild('adeleCanvas') private adeleCanvas;

  // Logo de adele, lanzador de onConfig
  private logo:Comando;
  // Boton de play, lanzador de onPlay
  private play:Comando;
  // Boton de erase, ejecuta un undo
  private erase:Comando;
  
  // Contador para posicionamiento
  private aPos:number;

  // Lista de comandos disponibles
  private comandos:Array<Comando>;
  // Lista de comandos a ejecutar (instruciones para adele)
  private programa:Array<Comando>;

  @Output() // Emisor de eventos para el onPlay
  private onPlay:EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  @Output() // Emisor de eventos para el onConfig
  private onConfig:EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor por defecto de la clase
   */
  constructor(private ngZone:NgZone) {
    this.comandos = new Array<Comando>();
    this.programa = new Array<Comando>();
    window.onresize = (e) =>{
        //ngZone.run will help to run change detection
        this.ngZone.run(() => {
          this.adeleCanvas.nativeElement.width  = window.innerWidth;
          this.adeleCanvas.nativeElement.height = window.innerHeight;
          this.redibujar(this.adeleCanvas.nativeElement.getContext('2d'));
        });
    };
  }

  /**
   * Wraper de on ready
   */
  ngAfterViewInit(){
    let ctx = this.adeleCanvas.nativeElement.getContext('2d');
    this.configCanvas(ctx);
    this.initComandos(ctx);
  }

  /**
   * Funcion para configurar el canvas; dimeciones y eventos sobre el mismo
   * @param ctx Contexto del canvas al configurar
   */
  private configCanvas(ctx:CanvasRenderingContext2D):void {
    this.adeleCanvas.nativeElement.width  = window.innerWidth;
    this.adeleCanvas.nativeElement.height = window.innerHeight;
    
    let c:Comando = null;
    let hammer = new window['Hammer'](this.adeleCanvas.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });

    //Manejo de toques sobre los botones de accion
    hammer.on('tap',(ev)=>{
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      console.info("Toque en: ",x,y);
      if(this.erase.estaDentro([x,y])){
        this.programa.pop();
        this.redibujar(ctx);
      }
      if(this.play.estaDentro([x,y])){
        this.emitPlay();
      }
      if(this.logo.estaDentro([x,y])){
        this.emitConfig();
      }
    });

    // Manejo de comienzos de arrastres.
    hammer.on('panstart',(ev)=>{
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      console.info("Iniciando drag: ",x,y);
      // Si el arrastre comienza en los comandos clonar y 
      // agregar a instrucciones de adele y seleciona el objeto
      for (let i=0;i<this.comandos.length && c==null;++i) {
        if(this.comandos[i].estaDentro([x,y])){
          c = this.comandos[i].clone();
          this.programa.push(c);
        }
      }
      // Si el arrastre comienza en las instrucciones solo
      // seleciona el objeto
      for (let i=0;i<this.programa.length && c==null;++i) {
        if(this.programa[i].estaDentro([x,y])){
          c = this.programa[i];
        }
      }
    });
    // Manejo de arrastre
    hammer.on('pan', (ev) => {
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      // si el arrastre comenzo sobre algun objeto moverlo
      if(c!=null){ 
        c.setPosicion([x,y]);
        this.redibujar(ctx);
      }
      //Si se esta terminando el arrastre deselecionar el objeto
      if(ev.isFinal){
        console.info("Terminando drag: ",x,y);
        c=null;
      }
    });
  }

  private initComandos(ctx:CanvasRenderingContext2D):void {
    let width  = window.innerWidth;
    let tamanio = width*0.075;// 5% de tamanio 
    

    //Botones de funcionamiento
    this.logo = new Comando(ctx,"config","assets/adele/adeleLogo.png",true);
    this.logo.setPosicion([tamanio+50,window.innerHeight-tamanio]);
    
    this.play = new Comando(ctx,"play","assets/adele/play.png",true);
    this.play.setTamanio([tamanio,tamanio]);
    this.play.setPosicion([window.innerWidth-(tamanio+10),tamanio]);
    
    this.erase = new Comando(ctx,"erase","assets/adele/erase.png",true);
    this.erase.setTamanio([tamanio,tamanio]);
    this.erase.setPosicion([window.innerWidth-(tamanio+5),window.innerHeight-(tamanio)]);
    
    this.aPos = width*0.1;

    //Comandos de adele
    this.addComando(new Comando(ctx,"u","assets/adele/arrowU.png",true));
    this.addComando(new Comando(ctx,"d","assets/adele/arrowD.png",true));
    this.addComando(new Comando(ctx,"l","assets/adele/arrowL.png",true));
    this.addComando(new Comando(ctx,"r","assets/adele/arrowR.png",true));
    this.addComando(new Comando(ctx,"c","assets/adele/clawC.png",true));
    this.addComando(new Comando(ctx,"o","assets/adele/clawO.png",true));
    this.addComando(new Comando(ctx,"q","assets/adele/color.png",true));
    this.addComando(new Comando(ctx,"m","assets/adele/note.png",true));
    

  }
  /**
   * Funcion para agregar un comando de forma ordenada
   * @param c Comando a agregar
   */
  private addComando(c:Comando):void{
    let width  = window.innerWidth;
    let space = width*0.025;// 2.5% del ancho para espacio entre comados.
    let tamanio = width*0.05;// 5% del ancho para el tamanio de los comandos

    c.setTamanio([tamanio,tamanio]);
    c.setPosicion([this.aPos,tamanio]);
    this.comandos.push(c);
    this.aPos = this.aPos+tamanio+space;
  }

  /**
   * Funcion para redibujar todos los componentes
   * @param ctx Contexto a redibujar
   */
  private redibujar(ctx:CanvasRenderingContext2D):void{
    ctx.clearRect(0, 0, this.adeleCanvas.nativeElement.width, this.adeleCanvas.nativeElement.height);
    this.logo.dibujar();
   
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
        ctx.quadraticCurveTo(
          Math.floor((p0[0]+p1[0])/2),
          Math.floor((p0[1]+k)/2),
          p1[0],
          p1[1]
        );
        ctx.stroke();
      }
    }
    for (let i=0;i<this.comandos.length;++i) {
      this.comandos[i].dibujar();
    }
    this.play.dibujar();
    this.erase.dibujar();
  }

  /**
   * Funcion para emitir evento onPlay
   */
  private emitPlay():void{
    let as = new Array<string>();
    for(let i=0; i<this.programa.length;++i){
      as.push(this.programa[i].getComando());
    }
    console.info("Event On Play: ",as);
    this.onPlay.emit(as);
  }

  /**
   * Funcion para emitir evento onConfig
   */
  private emitConfig():void{
    console.info("Event On Config");
    this.onConfig.emit();
  }

}
