import { Component, ViewChild, Output, EventEmitter, NgZone } from '@angular/core';
import { ScreenOrientation } from '@ionic-native/screen-orientation';

import { Comando } from './comando';

let PROPORCION_TAMANIO = 0.075;
let PROPORCION_CRESIMIENTO = 1.15;
let COLOR_STROKE = "#838383";
@Component({
  selector: 'AdeleView',
  templateUrl: 'adele-view.html'
})
export class AdeleViewComponent {

  // Canvas sobre el que se trabaja
  @ViewChild('adeleCanvas') private adeleCanvas;

  // Logo de adele, lanzador de onConfig
  private logo: Comando;
  // Boton de play, lanzador de onPlay
  private play: Comando;
  // Boton de erase, ejecuta un undo
  private erase: Comando;

  // Contador para posicionamiento
  private aPos: number;

  // Lista de comandos disponibles
  private comandos: Array<Comando>;
  // Lista de comandos a ejecutar (instruciones para adele)
  private programa: Array<Comando>;

  @Output() // Emisor de eventos para el onPlay
  private onPlay: EventEmitter<Array<string>> = new EventEmitter<Array<string>>();
  @Output() // Emisor de eventos para el onConfig
  private onConfig: EventEmitter<void> = new EventEmitter<void>();

  /**
   * Constructor por defecto de la clase
   */
  constructor(
    private screenOrientation: ScreenOrientation,
    private ngZone: NgZone
  ) {
    this.comandos = new Array<Comando>();
    this.programa = new Array<Comando>();
    console.info("Orientacion actual: ",this.screenOrientation.type);
    this.screenOrientation.onChange().subscribe(ev=>{
      this.ngZone.run(() => {
        let ctx = this.adeleCanvas.nativeElement.getContext('2d');
        let width = window.innerHeight;
        let height = window.innerWidth;

        let oldWidth = this.adeleCanvas.nativeElement.width;
        let oldHeight = this.adeleCanvas.nativeElement.height;

        this.adeleCanvas.nativeElement.width = width;
        this.adeleCanvas.nativeElement.height = height;

        this.aPos = width * 0.05;
        this.comandos=[];
        this.initComandos(ctx);

        for(let i=0;i<this.programa.length;++i){
          let tamanio = width * PROPORCION_TAMANIO;// 65% del ancho para el tamanio de los comandos
          this.programa[i].setTamanio([tamanio*PROPORCION_CRESIMIENTO, tamanio*PROPORCION_CRESIMIENTO]);
          let pos = this.programa[i].getPosicion();
          pos[0] = pos[0]*width/oldWidth;
          pos[1] = pos[1]*height/oldHeight;
          this.programa[i].setPosicion(pos);
        }
        this.redibujar(ctx);
      });

    });
  }

  /**
   * Wraper de on ready
   */
  ngAfterViewInit() {
    let ctx = this.adeleCanvas.nativeElement.getContext('2d');
    this.configCanvas(ctx);
    this.initComandos(ctx);
  }

  /**
   * Funcion para configurar el canvas; dimeciones y eventos sobre el mismo
   * @param ctx Contexto del canvas al configurar
   */
  private configCanvas(ctx: CanvasRenderingContext2D): void {
    this.adeleCanvas.nativeElement.width = window.innerWidth;
    this.adeleCanvas.nativeElement.height = window.innerHeight;

    let c: Comando = null;
    let hammer = new window['Hammer'](this.adeleCanvas.nativeElement);
    hammer.get('pan').set({ direction: window['Hammer'].DIRECTION_ALL });

    //Manejo de toques sobre los botones de accion
    hammer.on('tap', (ev) => {
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      console.info("Toque en: ", x, y);
      if (this.erase.estaDentro([x, y])) {
        this.programa.pop();
        this.redibujar(ctx);
      }
      if (this.play.estaDentro([x, y])) {
        this.toctoc(ctx, this.play.getPosicion());
        this.emitPlay();
      }
      if (this.logo.estaDentro([x, y])) {
        this.emitConfig();
      }
    });

    // Manejo de comienzos de arrastres.
    hammer.on('panstart', (ev) => {
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      console.info("Iniciando drag: ", x, y);
      // Si el arrastre comienza en los comandos clonar y
      // agregar a instrucciones de adele y seleciona el objeto
      for (let i = 0; i < this.comandos.length && c == null; ++i) {
        if (this.comandos[i].estaDentro([x, y])) {
          c = this.comandos[i].clone();
          let to = c.getTamanio();
          to[0] = to[0]*PROPORCION_CRESIMIENTO;
          to[1] = to[1]*PROPORCION_CRESIMIENTO;
          c.setTamanio(to);
          c.setLabel((this.programa.length+1).toString());
          this.programa.push(c);
        }
      }
      // Si el arrastre comienza en las instrucciones solo
      // seleciona el objeto
      for (let i = 0; i < this.programa.length && c == null; ++i) {
        if (this.programa[i].estaDentro([x, y])) {
          c = this.programa[i];
        }
      }
    });
    // Manejo de arrastre
    hammer.on('pan', (ev) => {
      let x = ev.pointers[0].clientX;
      let y = ev.pointers[0].clientY;
      // si el arrastre comenzo sobre algun objeto moverlo
      if (c != null) {
        c.setPosicion([x, y]);
        this.redibujar(ctx);
      }
      //Si se esta terminando el arrastre deselecionar el objeto
      if (ev.isFinal) {
        console.info("Terminando drag: ", x, y);
        c = null;
      }
    });
  }

  private initComandos(ctx: CanvasRenderingContext2D): void {
    let width = this.adeleCanvas.nativeElement.width;
    let height = this.adeleCanvas.nativeElement.height;
    let tamanio = width * PROPORCION_TAMANIO;// 5% de tamanio
    let space = width * 0.025;// 2.5% del ancho para espacio entre comados.

    //Botones de funcionamiento
    this.logo = new Comando(ctx, "config", "assets/adele/logo.svg", true);
    this.logo.setPosicion([tamanio*2 , height - (tamanio)]);
    this.logo.setTamanio([10000,tamanio]);

    this.play = new Comando(ctx, "play", "assets/adele/Play.svg", true);
    this.play.setTamanio([tamanio*1.2, tamanio*1.2]);
    this.play.setPosicion([width - (tamanio), tamanio/1.5]);

    this.erase = new Comando(ctx, "erase", "assets/adele/Errase.svg", true);
    this.erase.setTamanio([tamanio*1.2, tamanio*1.2]);
    this.erase.setPosicion([width - (tamanio), height - (tamanio)]);

    ctx.strokeStyle = COLOR_STROKE;
    ctx.beginPath();
    ctx.moveTo(0, tamanio+space);
    ctx.lineTo(width,tamanio+space);
    ctx.stroke();
    this.aPos = width * 0.05;

    //Comandos de adele
    this.addComando(new Comando(ctx, "F", "assets/adele/Forward.svg", true));
    this.addComando(new Comando(ctx, "B", "assets/adele/Backward.svg", true));
    this.addComando(new Comando(ctx, "L", "assets/adele/Left.svg", true));
    this.addComando(new Comando(ctx, "R", "assets/adele/Right.svg", true));
    this.addComando(new Comando(ctx, "C", "assets/adele/CloseClaw.svg", true));
    this.addComando(new Comando(ctx, "O", "assets/adele/OpenClaw.svg", true));
    this.addComando(new Comando(ctx, "P", "assets/adele/Colour.svg", true));
    this.addComando(new Comando(ctx, "N", "assets/adele/Music.svg", true));
  }
  /**
   * Funcion para posicionar un comando de forma ordenada
   * @param c Comando a agregar
   */
  private addComando(c: Comando): void {
    let width = this.adeleCanvas.nativeElement.width;
    let space = width * 0.025;// 2.5% del ancho para espacio entre comados.
    let tamanio = width * PROPORCION_TAMANIO;// 6.5% del ancho para el tamanio de los comandos

    c.setTamanio([tamanio, tamanio]);
    c.setPosicion([this.aPos, tamanio/1.5]);
    this.comandos.push(c);
    this.aPos = this.aPos + tamanio + space;
  }

  /**
   * Funcion para redibujar todos los componentes
   * @param ctx Contexto a redibujar
   */
  private redibujar(ctx: CanvasRenderingContext2D): void {
      ctx.clearRect(0, 0, this.adeleCanvas.nativeElement.width, this.adeleCanvas.nativeElement.height);
      let width = this.adeleCanvas.nativeElement.width;
      let space = width * 0.025;// 2.5% del ancho para espacio entre comados.
      let tamanio = width*PROPORCION_TAMANIO ;// 6.5% del ancho para el tamanio de los comandos
      ctx.fillStyle = COLOR_STROKE;
      ctx.beginPath();
      ctx.moveTo(0, tamanio+space);
      ctx.lineTo(width,tamanio+space);
      ctx.stroke();
      this.logo.dibujar();

      for (let i = 0; i < this.programa.length; ++i) {
        if (i < (this.programa.length - 1)) {
          let p0 = this.programa[i].getPosicion();
          let p1 = this.programa[i + 1].getPosicion();
          ctx.strokeStyle = COLOR_STROKE;
          ctx.beginPath();
          ctx.moveTo(p0[0],p0[1]);
          ctx.lineTo(p1[0],p1[1]);
          ctx.stroke();
        }
      }
      for (let i = 0; i < this.programa.length; ++i) {
        this.programa[i].dibujar();
      }
      for (let i = 0; i < this.comandos.length; ++i) {
        this.comandos[i].dibujar();
      }
      this.play.dibujar();
      this.erase.dibujar();
  }

  /**
   * Funcion para emitir evento onPlay
   */
  private emitPlay(): void {
    let as = new Array<string>();
    for (let i = 0; i < this.programa.length; ++i) {
      as.push(this.programa[i].getComando());
    }
    console.info("Event On Play: ", as);
    this.onPlay.emit(as);
  }

  /**
   * Funcion para emitir evento onConfig
   */
  private emitConfig(): void {
    console.info("Event On Config");
    this.onConfig.emit();
  }

  private a:number = 0;
  private toctoc(ctx:CanvasRenderingContext2D, position:[number,number],show:boolean=true):void{
    let p = this.adeleCanvas.nativeElement.width * (PROPORCION_TAMANIO*0.60);
    ++this.a;
    if(show){
      ctx.fillStyle = "#00ff00";
    }else{
      ctx.fillStyle = "#ffffff";
    }
    ctx.beginPath();
    ctx.arc(position[0],position[1],p,0,Math.PI*2,true);
    ctx.fill();
    this.play.dibujar();
    if(this.a<4){
      setTimeout(()=>{
        this.toctoc(ctx,position,!show);
      },250);
    }else{
      this.a=0;
    }
  }

}
