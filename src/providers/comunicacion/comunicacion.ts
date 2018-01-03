import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Injectable } from '@angular/core';

@Injectable()
export class ComunicacionProvider {
  private data:string;  

  public bonded: Array<any> = [];
  public unBonded: Array<any> = [];
  public isEnable:boolean = false;
  public searching:boolean = false;

  constructor(private bluetooth:BluetoothSerial) {
    this.bluetooth.isEnabled().then(
      ()=>{
        this.isEnable = true; 
        this.findBonded();
      }
    ).catch(
      ()=>{ this.isEnable = false; }
    );
  }

  private findBonded():void{
    this.bluetooth.list().then((data)=>{
      this.bonded = data;
    }).catch((err)=>{
      console.error("No se puede listar los dipositivos vinculados",err);
    });
  }

  public enable():void{
    console.log("Activando");
    this.bluetooth.enable().then(()=>{
      this.isEnable = true;
      this.findBonded();
    }).catch((err)=>{
      this.isEnable = false;
      console.error("No se puede activar el bluetooth,",err);
    });
  }

  public find():Promise<boolean>{
    return new Promise<boolean>((success,reject)=>{
      this.bluetooth.discoverUnpaired().then(
        (data)=>{
          this.unBonded = data;
          success(true);
        }
      ).catch(
        (err)=>{
          console.error("No se puede buscar dispositivos no pareados, ",err);
          success(false);
        }
      );
    });
  }

  public read():string{
    let c:string = null;
    if(this.data.length){
      c = this.data.charAt(0);
      this.data = this.data.substring(1);
    }
    return c;
  }

  public write(data:string):Promise<boolean>{
    return this.bluetooth.write(data);
  }
}
