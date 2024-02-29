import { Component } from '@angular/core';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'app-AgGrid';
  jsonData = "";

  getData() {
    /**
     * jsonData HttpClient
     * jsonData = {}
     * 
     */
  }

  deleteTest(e: any) {
    console.log(e);

    // ABRE POp up de confirmacion
    // SI, elimina
    // NO, no hace nada
    // OK
    // jsonData elimino el row por ID
    // jsonData
  }

  editTest() {

    /**
     * OK
     * jsonData se actualiza
     * jsonData
     */
  }

}
