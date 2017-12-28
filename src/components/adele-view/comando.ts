
export class Comando{
    private imagen:HTMLImageElement;
    private esDibujable:boolean;

    private posX:number;
    private posY:number;

    private tamX:number;
    private tamY:number;

    constructor(
        private contexto:CanvasRenderingContext2D,
        private comando:string,
        private imagenSrc:string,
        private dibujarAlCargar:boolean=false
    ){
        this.esDibujable = false;
        this.tamX = this.tamY = null;

        this.imagen = new Image();
        this.imagen.onload = ()=>{
            this.esDibujable = true;
            if(this.tamY===null){
                this.tamX = this.imagen.width;
                this.tamY = this.imagen.height; 
            }
            if(this.dibujarAlCargar){
                this.dibujar();
            }
        }
        this.imagen.src = this.imagenSrc;
    }

    public setPosicion(pos:[number,number]):void{
        this.posX = pos[0];
        this.posY = pos[1];
    }

    public getPosicion():[number,number]{
        return [this.posX,this.posY];
    }

    public setTamanio(tamanio:[number,number]):void{
        this.tamX = tamanio[0];
        this.tamY = tamanio[1];
    }

    public getTamanio():[number,number]{
        return [this.tamX,this.tamY];
    }

    public getComando():string{
        return this.comando;
    }

    public dibujar():void{
        if(this.esDibujable){
            this.contexto.drawImage(this.imagen,this.posX-(this.tamX/2),this.posY-(this.tamY/2),this.tamX,this.tamY);
        }
    }

    public estaDentro(coordenadas:[number,number]):boolean{
        let esta:boolean = false;
        if(
            coordenadas[0] >= (this.posX-(this.tamX/2)) && 
            coordenadas[0]<= (this.posX+(this.tamX/2)) && 
            coordenadas[1] >= this.posY-(this.tamY/2) && 
            coordenadas[1] <= (this.posY+(this.tamY/2)))
            {
                esta = true;
        }
        return esta;
    }


    public clone():Comando{
        let target:Comando = new Comando(this.contexto,this.comando,this.imagenSrc,this.dibujarAlCargar);
        target.setPosicion(this.getPosicion());
        target.setTamanio(this.getTamanio());
        return target;
    }

}