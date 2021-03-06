import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';

import { RegistersheetPage, RegisterreportPage, AppGlobals, LoginAsPage } from "../index.paginas";

import { DatabaseProvider } from "../../providers/database/database";
import { DataaccessProvider } from "../../providers/dataaccess/dataaccess";
import { GenericfunctionsProvider } from "../../providers/genericfunctions/genericfunctions";

@Component({
  selector: 'page-registerdirectory',
  templateUrl: 'registerdirectory.html',
})

export class RegisterdirectoryPage {

  /** @description: Cabecera inicial de la aplicación: */
  texto_cabecera: string = AppGlobals.TEXTO_CABECERA;

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public database:DatabaseProvider,
    public dataAccess: DataaccessProvider,
    public alertCtrl: AlertController,
    public genericFunction: GenericfunctionsProvider) {
  }

  /**
    * @name: open_register_sheet()
    * @description: Carga en memoria los datos de los productos que han sido registrados en la aplicación.
    */
  open_register_sheet() {
    //Carga en memoria los datos de los productos registrados:
    this.database.getRegisterFromLocal(AppGlobals.USER).then(response => {
      if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0)
        this.genericFunction.mostrar_toast('No hay registros que mostrar actualmente.');
      else
        this.navCtrl.push( RegistersheetPage );
    });
  }

  /**
    * @name: send_register_sheet()
    * @description: Envía a la plataforma los datos que habían sido registrados hasta el momento y los borra de memoria (dejan de poderse consultar en la app).
    */
  send_register_sheet() {
    //TODO: hacer doble comprobación (como en open_register_report) para evitar acceso en la BD si ya existen datos cargados en memoria:
    this.database.getRegisterFromLocal(AppGlobals.USER).then(()=>{
      if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0){
        this.genericFunction.mostrar_toast('No hay registros que enviar actualmente.');
      }else{
        //TODO: habilitar este método cuando esté el backend final.
        //TODO: recoger respuesta del servidor y mostrar si se ha completado con éxito el envío (notificar al usuario y borrar los datos de local si hay éxito)
        this.genericFunction.mostrar_toast('Datos de registro enviados con éxito.');
        //this.dataAccess.addRegisterToServer(AppGlobals.REGISTER_SHEET).then(data => {
          //Limpia los registros de la base de datos:
          AppGlobals.REGISTER_SHEET = [];
          this.database.deleteRegister();
        //});
      }
    });
  }

  /**
    * @name: open_register_report()
    * @description: Muestra un resumen de los productos escaneados (hora inicio, hora fin, cantidad de productos escaneados, etc).
    */
  open_register_report() {
    //Carga en memoria los datos de los productos registrados:
    if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0)
      this.database.getRegisterFromLocal(AppGlobals.USER).then(response => {
        if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0)
          this.genericFunction.mostrar_toast('No hay reporte de registros que mostrar actualmente.');
        else
          this.navCtrl.push( RegisterreportPage );
      });
    else
      this.navCtrl.push( RegisterreportPage );
  }

  //TODO: Envío del report a la plataforma (construir JSON y activar método addRegisterReportToServer())
  /**
    * @name: send_register_report()
    * @description: Envía a la plataforma el resumen de los productos escaneados hasta el momento y los borra de memoria (dejan de poderse consultar en la app),
    */
  send_register_report() {
    //Carga en memoria los datos de los productos registrados:
    if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0)
      this.database.getRegisterFromLocal(AppGlobals.USER).then(response => {
        if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0)
          this.genericFunction.mostrar_toast('No hay reporte de registros que enviar actualmente.');
        else{
          console.log("Envío de report a la plataforma."); //TODO: envío de registro a la plataforma
          // this.dataAccess.addRegisterReportToServer(AppGlobals.REGISTER_SHEET).then(data => {
            this.genericFunction.mostrar_toast('Datos del informe de registros enviado con éxito.');
          // });
        }
      });
    else
      console.log("Envío de report a la plataforma."); //TODO: envío de registro a la plataforma
      // this.dataAccess.addRegisterReportToServer(AppGlobals.REGISTER_SHEET).then(data => {
        this.genericFunction.mostrar_toast('Datos del informe de registros enviado con éxito.');
      // });
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
