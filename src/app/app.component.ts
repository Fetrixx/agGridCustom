import { Component } from '@angular/core';
import { JsonPaginaService } from './service/json-pagina.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-AgGrid';
  jsonData = "";

  constructor(public jsonPagina: JsonPaginaService){

  }

  getData(e: any) {
    /**
     * jsonData HttpClient
     * jsonData = {}
     */
    console.log("Test: \"getTest\"" +  e);

  }

  deleteTest(e: any) { // e = row
    console.log("Test: \"deleteTest\"" +  e);
    // ABRE POp up de confirmacion
    // SI, elimina
    // NO, no hace nada
    // OK
    // jsonData elimino el row por ID
    // jsonData
  }

  editTest(e: any) { // e = row
    console.log("Test: \"editTest\"" +  e);
    /**
     * OK
     * jsonData se actualiza
     * jsonData
     */
  }

}
