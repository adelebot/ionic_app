/**
 * Clase dibujable para manejo
 */
export class Comando{

    // Objeto imagen para dibujar en el canvas
    private imagen:HTMLImageElement;
    // Variable bandera para indicar si la imagen esta lista para desplegar
    private esDibujable:boolean;

    // Posicion en el eje x del objeto
    private posX:number;
    // Posicion en el eje y del objeto
    private posY:number;

    // Ancho del objeto
    private tamX:number;
    // Alto del objeto
    private tamY:number;

    /**
     * Constructor de la clase
     * @param contexto contexto 2D del canvas usado
     * @param comando nombre del comando
     * @param imagenSrc path de la imagen a usar
     * @param dibujarAlCargar dibujar al terminar la carga de la imagen
     */
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

    /**
     * Funcion para definir la posicion del objeto
     * @param pos par ordenado con la nueva posicion del objeto
     */
    public setPosicion(pos:[number,number]):void{
        this.posX = Math.floor(pos[0]);
        this.posY = Math.floor(pos[1]);
    }

    /**
     * Funcion para obtener la posicion del objeto
     * @returns par ordenado con la posicion del objeto
     */
    public getPosicion():[number,number]{
        return [this.posX,this.posY];
    }

    /**
     * Funcion para definir las dimenciones del obejeto
     * @param tamanio par ordenado con las dimenciones del objeto (ancho,alto)
     */
    public setTamanio(tamanio:[number,number]):void{
        this.tamX = Math.floor(tamanio[0]);
        this.tamY = Math.floor(tamanio[1]);
    }

    /**
     * Funcion para obtener las dimenciones del objeto
     * @returns par ordenado con la dimenciones del objeto (ancho, alto)
     */
    public getTamanio():[number,number]{
        return [this.tamX,this.tamY];
    }

    /**
     * Funcion para obtener el comando asignado al objeto
     * @returns nombre del comando
     */
    public getComando():string{
        return this.comando;
    }

    /**
     * Funcion para dibujar el objeto
     */
    public dibujar():void{
        if(this.esDibujable){
            this.contexto.drawImage(this.imagen,this.posX-(this.tamX/2),this.posY-(this.tamY/2),this.tamX,this.tamY);
        }
    }

    /**
     * Funcion para verificar si un punto (par ordenado) esta dentro del objeto
     * @param coordenadas par ordenado a verificar
     */
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

    /**
     * Funcion para obtener una copia del objeto
     * @returns copia del objeto
     */
    public clone():Comando{
        let target:Comando = new Comando(this.contexto,this.comando,this.imagenSrc,this.dibujarAlCargar);
        target.setPosicion(this.getPosicion());
        target.setTamanio(this.getTamanio());
        return target;
    }

}