import { Component } from '@angular/core';
import { NavController } from 'ionic-angular';
import { ScreenOrientation } from '@ionic-native/screen-orientation';


@Component({
  selector: 'page-home',
  templateUrl: 'home.html'
})
export class HomePage {

  constructor(public navCtrl: NavController,private screenOrientation: ScreenOrientation) {
    
  }

  ngAfterViewInit(){
    console.info("Orientacion actual: ",this.screenOrientation.type); 
    this.screenOrientation.lock(this.screenOrientation.ORIENTATIONS.LANDSCAPE)
    .then(
      ()=>{
        console.info("Cambio de orientacion a: ",this.screenOrientation.ORIENTATIONS.LANDSCAPE);
      }
    ).catch(
      (err)=>{
        console.error("No se puede cambio la orientacion",JSON.stringify(err));
      }
    );
  }

  public onPlay(data):void{
    console.log(data);
  }

  public onConfig():void{
    //TODO Open cofig screen
    console.log("onConfig");
  }

}
