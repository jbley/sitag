import { Component } from '@angular/core';
import { NavController, NavParams, AlertController } from 'ionic-angular';
import { FormBuilder, NgForm } from '@angular/forms';
import { LoadingController } from 'ionic-angular';

import { IniRegisterPage, AppGlobals, LoginAsPage, IniSuperuserPage } from "../index.paginas";

import { DatabaseProvider } from '../../providers/database/database';
import { DataaccessProvider } from '../../providers/dataaccess/dataaccess';
import { GenericfunctionsProvider } from '../../providers/genericfunctions/genericfunctions';


@Component({
  selector: 'page-register',
  templateUrl: 'register.html',
})
export class RegisterPage {
  /** @description: Cabecera inicial de la aplicación: */
  texto_cabecera: string = AppGlobals.TEXTO_CABECERA;
  /** @description: Esquema que da estructura a los datos del producto que serán mostrados al usuario. */
  schema: any;
  /** @description: Identificador del esquema requerido por el producto. */
  schema_identifier: string;
  /** @description: Datos del producto escaneado. */
  general_info: any;
  /** @description: Lista de atributos del producto que serán mostrados al usuario. */
  elements: any = [];

  constructor(
    public navCtrl: NavController,
    public navParams: NavParams,
    public formBuilder: FormBuilder,
    public dataAccess: DataaccessProvider,
    public alertCtrl: AlertController,
    public loadingCtrl: LoadingController,
    public database:DatabaseProvider,
    public genericFunction: GenericfunctionsProvider)
  {

    let loader = this.loadingCtrl.create({});
    //Comprueba si hay conexión a internet.
    if(AppGlobals.NETWORK_AVAILABLE){
      loader.present().then(() => {
        dataAccess.getProductInfo(AppGlobals.PRODUCT_LABEL).then(data => {
          this.general_info = data;
          this.schema_identifier = this.general_info.registers[0].idSchema;
        }).then(data => {
          dataAccess.getAllSchemas().then(data => {
            AppGlobals.SCHEMA_LIST = data;

            //Comprueba hay algún esquema disponible para este producto.
            if(AppGlobals.SCHEMA_LIST === undefined || AppGlobals.SCHEMA_LIST.length == 0){
              let alert = this.alertCtrl.create({
                title: '¡Error!',
                subTitle: 'No existe ningún esquema disponible.',
                buttons: ['OK']
              });
              alert.present();
            }else{
              for(let current_schema of AppGlobals.SCHEMA_LIST.registers){
                if(current_schema.idSchema == this.general_info.registers[0].idSchema)
                  this.schema = current_schema;
              }

              //Comprueba con el esquema si el elemento debe ser mostrado (si tiene permisos de registro).
              for(let element of this.schema.attributes){
                if(element.control.substring(0,1) == "1")
                  this.elements.push(element.name);
              }
            }
            loader.dismiss();
          });
        });
      });
    }else{
      //Si no hay conexión a internet ni ningún esquema cargado en memoria:
      if(AppGlobals.DEFAULT_SCHEMA === undefined || AppGlobals.DEFAULT_SCHEMA.length == 0){
        let alert = this.alertCtrl.create({
          title: '¡Error!',
          subTitle: 'No existe ningún esquema disponible.',
          buttons: ['OK']
        });
        alert.present();
      }else{
        //Comprueba con el esquema si el elemento debe ser mostrado (si tiene permisos de registro).
        for(let element of AppGlobals.DEFAULT_SCHEMA.registers[0].attributes){
          if(element.control.substring(0,1) == "1")
            this.elements.push(element.name);
        }
      }
    }
  }

  /**
    * @name: save(data : NgForm)
    * @description: Guarda los datos del registro en el backend.
    * @param: Recibe los datos recogidos por el formulario.
    */
  save(data: NgForm) {
    //Extrae las claves generadas en el form:
    let ngForm_keys = Object.keys(data.value);

    //Guarda en memoria los datos introducidos por el usuario:
    //Si no existe ningún registro,
    if(AppGlobals.REGISTER_SHEET === undefined || AppGlobals.REGISTER_SHEET.length == 0){
        let attributes:any = [];

        for (let key of ngForm_keys){
          attributes.push({
            name: key,
            value: data.value[key],
          });
        }

      let label = this.genericFunction.buildLabel(this.general_info.registers[0].attributes);

      AppGlobals.REGISTER_SHEET =
        {
        user: AppGlobals.USER,
        countRegisters: "1",
        lastModified: this.genericFunction.timeStamp,
        registers: [
        {
        idSchema: this.general_info.registers[0].idSchema,
        type: this.general_info.registers[0].type,
        id: AppGlobals.PRODUCT_LABEL,
        label: label,
        dateTime: this.genericFunction.timeStamp,//this.general_info.registers[0].dateTime,
        countAttributes: attributes.length.toString(),
        attributes: attributes
        },
        ]
        };
    }else{
      //Hay al menos un registro en memoria.
      let attributes:any = [];

      let countRegisters:number = AppGlobals.REGISTER_SHEET.countRegisters;
      countRegisters++;

      AppGlobals.REGISTER_SHEET.countRegisters = countRegisters.toString();
      AppGlobals.REGISTER_SHEET.lastModified = this.genericFunction.timeStamp;

      for (let key of ngForm_keys){
        attributes.push({
          name: key,
          value: data.value[key],
        });
      }

      let label = this.genericFunction.buildLabel(this.general_info.registers[0].attributes);

        AppGlobals.REGISTER_SHEET.registers.push({
          idSchema: this.general_info.registers[0].idSchema,
          type: this.general_info.registers[0].type,
          id: AppGlobals.PRODUCT_LABEL,
          label: label,
          dateTime: this.genericFunction.timeStamp,//this.general_info.registers[0].dateTime,
          countAttributes: attributes.length.toString(),
          attributes: attributes
        });
    }


    //Guarda los datos del registro en local.
    this.database.addRegisterToLocal(AppGlobals.USER, JSON.stringify(AppGlobals.REGISTER_SHEET));
    this.genericFunction.mostrar_toast('Datos de registro guardados.');

    console.log("Register sheet:");
    console.log(AppGlobals.REGISTER_SHEET);

    //Añade al servidor el registro.
    this.dataAccess.addRegisterToServer(AppGlobals.REGISTER_SHEET);

    if(AppGlobals.IS_OWNER)
      this.navCtrl.push ( IniSuperuserPage );
    else
      this.navCtrl.push ( IniRegisterPage );
  }

  /**
    * @name: getUsername()
    * @description: Devuelve el nick del usuario que está validado en la aplicación.
    */
  get getUsername() {
   return AppGlobals.USER;
  }

  /**
    * @name: getProductLabel()
    * @description: Devuelve el la etiqueta del producto escaneado.
    */
  get getProductLabel() {
   return AppGlobals.PRODUCT_LABEL;
  }

  /**
    * @name: backHome()
    * @description: Navega hacia la interfaz de selección de tipo de usuario.
    */
  backHome(){
    this.navCtrl.push ( LoginAsPage );
  }
}
