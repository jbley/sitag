import { Component } from '@angular/core';
import { NavController, NavParams, LoadingController, AlertController } from 'ionic-angular';

import { RegisterPage, RegisterdirectoryPage, GeneralinfoPage, AppGlobals, LoginAsPage } from "../index.paginas";

import { GenericfunctionsProvider } from '../../providers/genericfunctions/genericfunctions';
//plugin
import { BarcodeScanner } from '@ionic-native/barcode-scanner';

@Component({
  selector: 'page-ini-register',
  templateUrl: 'ini-register.html',
})
export class IniRegisterPage {
  /** @description: Cabecera inicial de la aplicación: */
  texto_cabecera: string = AppGlobals.TEXTO_CABECERA;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    private barcodeScanner: BarcodeScanner,
    public loadingCtrl: LoadingController,
    public alertCtrl: AlertController,
    public genericFunction: GenericfunctionsProvider) {
  }

  /**
    * @name: start_register()
    * @description: Escanea un código QR, comprueba si el usuario escaneando tiene permisos para registrar/visualizar ese producto. Guarda la etiqueta escaneada en la variable
    * AppGlobals.PRODUCT_LABEL
    */
  start_register() {
    this.barcodeScanner.scan().then((barcodeData) => {
      console.log("Datos del scan: ", barcodeData.text);
      AppGlobals.PRODUCT_LABEL = barcodeData.text;

      //Comprueba si tiene permisos para registrar el producto que se ha escaneado:
      if(this.genericFunction.check_hasPermissions())
        if(this.genericFunction.alreadyRegistered()){
          let alert = this.alertCtrl.create({
            title: '¡Error!',
            subTitle: 'Ese producto ya ha sido registrado.',
            buttons: ['OK']
          });
          alert.present();
        }else
          this.navCtrl.push( RegisterPage );
      else
        if(this.genericFunction.check_isVisualizer(AppGlobals.PRODUCT_LABEL))
          this.navCtrl.push( GeneralinfoPage );
        else{
          let alert = this.alertCtrl.create({
            title: '¡Error!',
            subTitle: 'No tienes permisos para visualizar este producto.',
            buttons: ['OK']
          });
          alert.present();
        }
    }, (err) => {
      console.error("Error: ", err);
      this.genericFunction.mostrar_toast("Error del scan: " + err);
    });
  }

  /**
    * @name: register_directory()
    * @description: Navega hacia la interfaz de directorio de registro.
    */
  register_directory() {
    this.navCtrl.push( RegisterdirectoryPage );
  }

  /**
    * @name: getUsername()
    * @description: Devuelve el nick del usuario que está validado en la aplicación.
    */
  get getUsername() {
   return AppGlobals.USER;
  }

  /**
    * @name: backHome()
    * @description: Navega hacia la interfaz de selección de tipo de usuario.
    */
  backHome(){
    this.navCtrl.push ( LoginAsPage );
  }

}
