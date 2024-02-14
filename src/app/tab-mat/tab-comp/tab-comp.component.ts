import { Component, ViewChild, AfterViewInit, HostListener, input, Input } from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';

import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';



@Component({
  selector: 'app-tab-mat-comp',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css'
})
export class TabCompComponent implements AfterViewInit {

  @Input() jsonLink: string = '';

  displayedColumns: string[] = [];
  //dataSource: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selectedRowIndex = -1; // Inicialmente ninguna fila seleccionada
  selectedRowCount: number = 0;

  



  /*
  @ViewChild(MatSort)
  sort: MatSort = new MatSort;
  */

  @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null;
  //@ViewChild('paginator') paginator: MatPaginator | null = null;

  selection = new SelectionModel<any>(true, []);
  private lastSelectedRowIndex: number | null = null; // Nueva propiedad para manejar la última fila seleccionada con Shift+Click
  private preSortSelection: Set<any[]> = new Set<any[]>(); // Nueva propiedad para almacenar las filas seleccionadas antes de la clasificación


  pageSizes: number[] = [5, 10, 20, 50, 100];

  constructor(private http: HttpClient) { }

  ngAfterViewInit() {
    this.loadTableDataSelector();
  }

  

  @HostListener('document:keydown.escape', ['$event'])
  handleKeyboardEvent(event: KeyboardEvent) {
    if (event.key === "Escape") {
      this.deselectAllRows();
    }
  }

  // Método para actualizar el contador de filas seleccionadas
  updateSelectedRowCount() {
    this.selectedRowCount = this.selection.selected.length;
  }

  rowClick(row: any[], event: MouseEvent) {
    const isCtrlPressed = event.ctrlKey;
    const isShiftPressed = event.shiftKey;
    if (isCtrlPressed) {
      // Si Ctrl está presionado, simplemente alternar la selección de la fila
      this.selection.toggle(row);
    } else if (isShiftPressed && this.lastSelectedRowIndex !== null) {
      // Si Shift está presionado, seleccionar en rango
      const start = Math.min(this.lastSelectedRowIndex, this.dataSource.data.indexOf(row));
      const end = Math.max(this.lastSelectedRowIndex, this.dataSource.data.indexOf(row));
      for (let i = start; i <= end; i++) {
        this.selection.select(this.dataSource.data[i]);
      }
    } else {
      // Si no hay teclas especiales, seleccionar solo la fila
      this.selection.clear();
      this.selection.select(row);
    }
    // Actualizar el índice de la última fila seleccionada y almacenar la selección antes de la clasificación
    this.lastSelectedRowIndex = this.dataSource.data.indexOf(row);
    this.preSortSelection = new Set(this.selection.selected);
    this.updateSelectedRowCount()
  }

  loadTableDataSelector() {
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator
          if (this.sort) {
            this.dataSource.sort = this.sort; // Asignar MatSort a MatTableDataSource si sort no es null
          }

        }
      });
  }

  loadTableDataDirect() {
    this.http.get<any[]>('https://hp-api.onrender.com/api/characters')
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator
          if (this.sort) {
            this.dataSource.sort = this.sort; // Asignar MatSort a MatTableDataSource si sort no es null
          }

        }
      });
  }

  selectRow(row: any) {
    this.selectedRowIndex = row.index; // Actualiza el índice de la fila seleccionada
  }

  

  // Seleccion inversa
  selectAllUnselectedRows() {
    // Obtener todas las filas de la fuente de datos
    const allRows = this.dataSource.data;
    // Filtrar las filas que aún no están seleccionadas
    const unselectedRows = allRows.filter(row => !this.selection.isSelected(row));
    // Deseleccionar todas las filas previamente seleccionadas
    this.selection.clear();
    // Seleccionar todas las filas que no estaban seleccionadas previamente
    unselectedRows.forEach(row => this.selection.select(row));
  }

  deselectAllRows() {
    this.selection.clear();
    this.lastSelectedRowIndex = null;
    this.preSortSelection.clear();
    this.selectedRowCount = 0;
    this.selectedRowIndex = -1;
  }

  logSelectedRows() {
    console.log('Selected Rows:', this.selection.selected);    
  }
  
  stopPropagation(event: MouseEvent){
    event.stopPropagation();
}

  applyFilter(event: Event) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  


  /*
  loadTableData3() {
    this.http.get<any[]>('https://hp-api.onrender.com/api/characters')
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource = data;
        }
      });
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
  */




  exportToExcel() {
    // Implementar la exportación a Excel aquí
  }

  exportAllToExcel() {
    // Implementar la exportación de todos los datos a Excel aquí
  }

  getSelectedRowData() {
    // Implementar la lógica para obtener los datos de la fila seleccionada
    this.logSelectedRows();
  }

  

  sizeToFit() {
    // Implementar la lógica para ajustar el tamaño de las columnas
  }
}


