import { Injectable,Input } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


//../assets/formattedHpApiCharAll_test.json
@Injectable({
  providedIn: 'root'
})
export class JsonPaginaService {

  //@Input() jsonServiceData:string = '../assets/formattedHpApiCharAll_test.json';
  info:any={};
  cargada=false;
  constructor(private http:HttpClient) { 
    /*console.log("Json service corriendo")
    http.get(this.jsonServiceData)
    .subscribe(resp => {
      this.info=resp;
      this.cargada = true;
      console.log(this.info);
      console.log((this.info));
    })*/
  }

  getJsonData(jsonLink: string): Observable<any>{
    return this.http.get<any>(jsonLink)
  }

  getAAA(){

  }


  getConfigData(jsonLink: string): Observable<any[]> | null{
    //this.http.get<{ config: ColumnConfig[] }>(this.jsonLink) // get "config" de type any[] dentro del json
    //this.getJsonData(jsonLink)
    this.http.get<any>(jsonLink)
      .subscribe(data => {
        if (data && data.config && data.config.length > 0) {
          //const configData = data.config;
          //this.configColumnas = configData;
          const configData = data.config;
          return configData;
        }
      });
      return null
  }

  /*
  loadConfigData() {
    //this.http.get<{ config: ColumnConfig[] }>(this.jsonLink) // get "config" de type any[] dentro del json
    this.jsonService.getJsonData(this.jsonLink)
      .subscribe(data => {
        if (data && data.config && data.config.length > 0) {
          const configData = data.config;
          this.configColumnas = configData;
        }
      });

  }
  */
}
