import { Component } from '@angular/core';
import { Platform } from 'ionic-angular';
import { StatusBar } from '@ionic-native/status-bar';
import { SplashScreen } from '@ionic-native/splash-screen';

import { AndroidPermissions } from '@ionic-native/android-permissions';

import { ComunicacionProvider } from '../providers/comunicacion/comunicacion';

import { HomePage } from '../pages/home/home';
@Component({
  templateUrl: 'app.html'
})
export class MyApp {
  rootPage:any = HomePage;

  constructor(
    private platform: Platform,
    private statusBar: StatusBar,
    private splashScreen: SplashScreen,
    private androidPermissions: AndroidPermissions,
    private comunicacion: ComunicacionProvider
  ) {
    platform.ready().then(() => {
      // Okay, so the platform is ready and our plugins are available.
      // Here you can do any higher level native things you might need.
      statusBar.styleDefault();
      splashScreen.hide();
      this.askPermission(this.androidPermissions.PERMISSION.ACCESS_COARSE_LOCATION).then(()=>{
        this.askPermission(this.androidPermissions.PERMISSION.BLUETOOTH).then(()=>{
            this.askPermission(this.androidPermissions.PERMISSION.BLUETOOTH_ADMIN).then(()=>{
              if(!this.comunicacion.isEnable){
                this.comunicacion.enable().then(()=>{}).catch(()=>{});
              }
            }).catch(()=>{
              // TODO alert no funcionara
            });
        }).catch(()=>{
          // TODO alert no funcionara
        });
      }).catch(()=>{
        // TODO alert no funcionara
      });

    });
  }

  private askPermission(permission:string):Promise<void>{
    return new Promise<void>((success,reject)=>{
      this.androidPermissions.checkPermission(permission).then(
        (result) => {
          success();
        },
        (err) => {
          this.androidPermissions.requestPermission(permission).then(
            (result)=>{success();},
            (err)=>{reject();}
          );
        }
      );
    });
  }
}
