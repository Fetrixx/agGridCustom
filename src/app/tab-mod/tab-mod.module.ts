import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TabCompComponent } from './tab-comp/tab-comp.component';

import { AgGridAngular } from 'ag-grid-angular';
import { TableModule } from 'primeng/table';
import { HttpClientModule } from '@angular/common/http';
import { AgGridModule } from 'ag-grid-angular';

import {MatButtonModule} from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatInputModule } from '@angular/material/input';
import { FlexLayoutModule } from '@angular/flex-layout';
import { MatCheckboxModule } from '@angular/material/checkbox';
import {MatIconModule} from '@angular/material/icon';
import {MatSelectModule} from '@angular/material/select';
import {MatTableModule} from '@angular/material/table';

@NgModule({
  declarations: [
    TabCompComponent
  ],
  imports: [
    CommonModule,
    AgGridAngular,
    HttpClientModule,
    AgGridModule,
    MatButtonModule,
    MatMenuModule,
    MatCardModule,
    FlexLayoutModule,
    MatInputModule,
    MatCheckboxModule,
    MatIconModule,
    MatSelectModule,
    MatTableModule

  ],
  exports:[
    TabCompComponent
  ]
})
export class TabModModule { }
