import { Component, ViewChild } from '@angular/core';

import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';



@Component({
  selector: 'app-tab-mat-comp',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css'
})
export class TabCompComponent {
  
  displayedColumns: string[] = [];
  dataSource: any[] = [];
  selectedRowCount: number = 0;
  selection = new MatTableDataSource<any>([]); // Definición de la propiedad 'selection'

  @ViewChild(MatSort)
  sort: MatSort = new MatSort;

  

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadTableData();
  }

  loadTableData2() {
    this.http.get<any[]>('https://hp-api.onrender.com/api/characters')
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource = data;
        }
      });
  }

  loadTableData() {
    this.http.get<any[]>('https://hp-api.onrender.com/api/characters')
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource = data;
          this.selection = new MatTableDataSource<any>(this.dataSource);
          this.selection.sort = this.sort;
        }
      });
  }

  rowClick(){ // a implementar 
  }


  exportToExcel() {
    // Implementar la exportación a Excel aquí
  }

  exportAllToExcel() {
    // Implementar la exportación de todos los datos a Excel aquí
  }

  getSelectedRowData() {
    // Implementar la lógica para obtener los datos de la fila seleccionada
  }

  updateSelectedRowCount() {
    // Implementar la lógica para actualizar el recuento de filas seleccionadas
  };

  sizeToFit() {
    // Implementar la lógica para ajustar el tamaño de las columnas
  }
}


