import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ConfigPage } from '../config/config';

import { ComunicacionProvider } from '../../providers/comunicacion/comunicacion';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController,
    private comunicacion: ComunicacionProvider
  ) {
    if(!this.comunicacion.isEnable){
      this.comunicacion.enable().then(()=>{}).catch(()=>{});
    }
  }

  public onPlay(data:Array<string>):void{
    let msg = "";
    for(let i=0;i<data.length;++i){
      msg += data[i];
    }
    this.comunicacion.write(msg).then(()=>{
      //Handle succes write
    }).catch((err)=>{
      console.error(err);
    });
  }

  public onConfig():void{
    this.navCtrl.push(ConfigPage);
  }

}
