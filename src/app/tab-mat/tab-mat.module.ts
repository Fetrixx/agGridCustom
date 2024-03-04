import { NgModule } from '@angular/core';
import { CommonModule, DatePipe, DecimalPipe } from '@angular/common';
import { TabCompComponent } from './tab-comp/tab-comp.component';

import { HttpClientModule } from '@angular/common/http';


import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatTableModule } from '@angular/material/table';

import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { BrowserModule } from '@angular/platform-browser';
import { MatFormFieldModule } from '@angular/material/form-field';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { CdkTableModule } from '@angular/cdk/table';
import { CdkTreeModule } from '@angular/cdk/tree';
import { A11yModule } from '@angular/cdk/a11y';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';

import { AgGridAngular } from 'ag-grid-angular';
import { AgGridModule } from 'ag-grid-angular';

import { DatesCustomPipe } from '../pipes/dates-custom.pipe';
//import { NumberCustomPipe } from '../pipes/number-custom.pipe';

import {MatChipEditedEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData } from '@angular/common';
import localeEs from '@angular/common/locales/es'

registerLocaleData(localeEs);


/*
export class CustomPaginatorIntl extends MatPaginatorIntl {
  override itemsPerPageLabel = 'Items por Pagina:';
  override nextPageLabel = 'Siguiente';
  override previousPageLabel = 'Anterior';
  override firstPageLabel = "Primera Pagina";
  override lastPageLabel = "Ultima Pagina";



  // Customize other labels as needed based on locale
}*/
/*
export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();

  //customPaginatorIntl.itemsPerPageLabel = 'rows per page';
  customPaginatorIntl.itemsPerPageLabel = 'Items por Pagina:';
  customPaginatorIntl.nextPageLabel = 'Siguiente';
  customPaginatorIntl.previousPageLabel = 'Anterior';
  customPaginatorIntl.firstPageLabel = "Primera Pagina";
  customPaginatorIntl.lastPageLabel = "Ultima Pagina";

  return customPaginatorIntl;
}

*/

import { MatPaginatorIntl } from '@angular/material/paginator';

export function CustomPaginator() {
  const customPaginatorIntl = new MatPaginatorIntl();
  
  customPaginatorIntl.itemsPerPageLabel = 'Items por Pagina:';
  customPaginatorIntl.nextPageLabel = 'Siguiente';
  customPaginatorIntl.previousPageLabel = 'Anterior';
  customPaginatorIntl.firstPageLabel = "Primera Pagina";
  customPaginatorIntl.lastPageLabel = "Ultima Pagina";
  /*
  customPaginatorIntl.itemsPerPageLabel = 'Ítems por Página:';
  customPaginatorIntl.nextPageLabel = 'Siguiente';
  customPaginatorIntl.previousPageLabel = 'Anterior';
  customPaginatorIntl.firstPageLabel = "Primera Página";
  customPaginatorIntl.lastPageLabel = "Última Página";
  */

  return customPaginatorIntl;
}

@NgModule({
  declarations: [
    TabCompComponent,
    DatesCustomPipe,
    //NumberCustomPipe
    //CustomDateFormatPipe
  ],
  imports: [
    CommonModule,
    HttpClientModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule,
    MatCheckboxModule,
    MatMenuModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    BrowserModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatNativeDateModule,
    MatCardModule,
    MatPaginatorModule,
    MatSortModule,
    MatInputModule,
    FlexLayoutModule,
    MatTooltipModule,
    MatProgressSpinnerModule,

    DragDropModule,
    ScrollingModule,
    CdkTableModule,
    CdkTreeModule,
    A11yModule,


    AgGridAngular,
    AgGridModule,

    
    MatChipsModule



    

  ],
  exports: [
    TabCompComponent
  ],
  providers: [
    DatePipe,
    DecimalPipe,
    {provide: LOCALE_ID, useValue: 'es'},
    //{ provide: MatPaginatorIntl, useClass: CustomPaginatorIntl } // Optionally, provide a custom paginator labels based on locale
    { provide: MatPaginatorIntl, useValue: CustomPaginator() }
]
})
export class TabMatModule { }




