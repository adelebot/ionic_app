import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';

import { ConfigPage } from '../config/config';

@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(
    public navCtrl: NavController
  ) {
  }

  public onPlay(data):void{
    console.log(data);
  }

  public onConfig():void{
    this.navCtrl.push(ConfigPage);
  }

}
