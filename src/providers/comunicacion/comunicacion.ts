import { BluetoothSerial } from '@ionic-native/bluetooth-serial';
import { Injectable,NgZone } from '@angular/core';

@Injectable()
export class ComunicacionProvider {
  private data:string;  

  public bonded: Array<any> = [];
  public unBonded: Array<any> = [];

  public isEnable:boolean = false;
  public isConnected:boolean = false;
  public searching:boolean = false;

  constructor(
    private bluetooth:BluetoothSerial,
    private zone:NgZone
  ) {
    this.bluetooth.isEnabled().then(
      ()=>{
        this.zone.run(()=>{
          this.isEnable = true; 
        });
        this.findBonded();
        this.bluetooth.isConnected().then((data)=>{
          this.isConnected = true;
          this.subscribe();
        }).catch((err)=>{
          this.zone.run(()=>{
            this.isConnected = false;
          });
        });
      }
    ).catch(
      ()=>{ 
        this.zone.run(()=>{
          this.isEnable = false;
        }); 
      }
    );
  }

  private subscribe():void{
    this.bluetooth.subscribe('\n').subscribe((data)=>{
      this.zone.run(()=>{
        this.data+=data;
      });
    });
  }

  private findBonded():void{
    this.bluetooth.list().then((data)=>{
      this.zone.run(()=>{
        this.bonded = data;
      });
    }).catch((err)=>{
      console.error("No se puede listar los dipositivos vinculados",err);
    });
  }

  public enable():Promise<void>{
    return new Promise<void>((success,reject)=>{
      console.log("Activando");
      this.bluetooth.enable().then(()=>{
        this.zone.run(()=>{
          this.isEnable = true;
        });
        this.findBonded();
        this.bluetooth.isConnected().then((data)=>{
          this.zone.run(()=>{
            this.isConnected = true;
          });
          this.subscribe();
          success();
        }).catch((err)=>{
          this.zone.run(()=>{
            this.isConnected = false;
          });
          success();
        });
      }).catch((err)=>{
        this.zone.run(()=>{
          this.isEnable = false;
        });
        reject();
        console.error("No se puede activar el bluetooth,",err);
      });
    });

  }

  public findUnBonded():Promise<void>{
    return this.find();
  }

  public find():Promise<void>{
    return new Promise<void>((success,reject)=>{
      this.bluetooth.discoverUnpaired().then(
        (data)=>{
          this.zone.run(()=>{
            this.unBonded = data;
          });
          success();
        }
      ).catch(
        (err)=>{
          console.error("No se puede buscar dispositivos no pareados, ",err);
          reject();
        }
      );
    });
  }

  public connect(dispositivo:any):Promise<void>{
    return new Promise((success,reject)=>{
      this.bluetooth.connect(dispositivo.id).subscribe((data)=>{
        if(data=="OK"){
          this.zone.run(()=>{
            this.isConnected = true;
          });
          success();
        }else{
          console.error("Se a desconectado del dispositivo, ",data);
          this.zone.run(()=>{
            this.isConnected = false;
          });
          reject();
        }
      },(err)=>{
        console.error("No se a podido conectar del dispositivo, ",err);
        this.zone.run(()=>{
          this.isConnected = false;
        });
        reject();
      });
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

  public disconnect():Promise<void>{
    return new Promise<void>((success,reject)=>{
      this.bluetooth.disconnect().then(()=>{
        this.zone.run(()=>{
          this.isConnected = false;
        });
        success();
      }).catch((err)=>{
        reject();
      });
    });
  }
}
