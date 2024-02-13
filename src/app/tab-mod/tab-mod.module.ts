import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabCompComponent } from './tab-comp/tab-comp.component';

import { AgGridAngular } from 'ag-grid-angular';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';

import {MatButtonModule} from '@angular/material/button';

@NgModule({
  declarations: [
    TabCompComponent
  ],
  imports: [
    CommonModule,
    AgGridAngular,
    TableModule,
    HttpClientModule,
    AgGridModule,
    MatButtonModule,
    

  ],
  exports:[
    TabCompComponent
  ]
})
export class TabModModule { }
