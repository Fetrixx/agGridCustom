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
  providers: [DatePipe, DecimalPipe]
})
export class TabMatModule { }




