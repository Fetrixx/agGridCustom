/*
      -- last changes -- 

ocultar las columnas - YA - mejorar el  "reaparecer" o "it's a feature"
seleccion inversa - YA
arreglar exportación - YA- Se formatearon los objetos anidados para representarse como strings.
export fix, alternate nam, wand, alternate actor
all fields that are a  [] or  a {}
cambiar el orden de las columnas arrastrandolas - YA



todo / por hacer:


agregar el codigo para cambiar las tablas aggrid y internal desde el selector en app.html






*/









import { Component, ViewChild, AfterViewInit, HostListener, Input } from '@angular/core';

import { SelectionModel } from '@angular/cdk/collections';

import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';



@Component({
  selector: 'tabla-nativa',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css'
})
export class TabCompComponent implements AfterViewInit {

  @Input() jsonLink: string = '';

  displayedColumns: string[] = [];
  allColumns: string[] = [];
  //dataSource: any[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selectedRowIndex = -1; // Inicialmente ninguna fila seleccionada
  selectedRowCount: number = 0;


  @ViewChild(MatSort, { static: true }) sort: MatSort | null = null;
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null;
  //@ViewChild('paginator') paginator: MatPaginator | null = null;

  selection = new SelectionModel<any>(true, []);
  private lastSelectedRowIndex: number | null = null; // Nueva propiedad para manejar la última fila seleccionada con Shift+Click
  private preSortSelection: Set<any[]> = new Set<any[]>(); // Nueva propiedad para almacenar las filas seleccionadas antes de la clasificación


  pageSizes: number[] = [10, 20, 50, 100];

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

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


  /*
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
    }*/

  /*
    loadTableDataSelector() {
      this.http.get<any[]>(this.jsonLink)
        .subscribe(data => {
          if (data.length > 0) {
            this.displayedColumns = Object.keys(data[0]);
            this.dataSource.data = data;
            this.dataSource.paginator = this.paginator;
            if (this.sort) {
              this.dataSource.sort = this.sort;
              this.dataSource.sort.sortChange.subscribe(() => {
                this.adjustSelectionAfterSort();
              });
            }
          }
        });
    }
    */

  // PARA HACER COLUMNAS VISIBLES, FUNDIO EL SORT
  /*
  loadTableDataSelector() {
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.displayedColumns.forEach(column => {
            this.columnVisibility[column] = true; // Inicialmente todas las columnas visibles
          });
          this.dataSource.data = data;
        }
      });
  }
  */

  columnVisibility: { [key: string]: boolean } = {};

  // cargar la tabla  (errores con objetos anidados)
  loadTableDataSelector__() {
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          this.displayedColumns = Object.keys(data[0]);
          this.dataSource.data = data;
          this.dataSource.paginator = this.paginator;
          if (this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sort.sortChange.subscribe(() => {
              this.adjustSelectionAfterSort();
            });
          }
          this.displayedColumns.forEach(column => {
            this.columnVisibility[column] = true; // Inicialmente todas las columnas visibles
          });
        }
      });
  }

  // maneja de forma basica los objetos con anidacion encontrados en el json
  loadTableDataSelector______() {
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          // Mapear los objetos para convertir los objetos anidados a strings
          const modifiedData = data.map(item => {
            const modifiedItem: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              if (typeof item[key] === 'object' && item[key] !== null) {
                // Si el valor es un objeto, convertirlo a string
                modifiedItem[key] = JSON.stringify(item[key]);
              } else {
                modifiedItem[key] = item[key];
              }
            }
            return modifiedItem;
          });

          this.displayedColumns = Object.keys(modifiedData[0]);
          this.dataSource.data = modifiedData;
          this.dataSource.paginator = this.paginator;
          if (this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sort.sortChange.subscribe(() => {
              this.adjustSelectionAfterSort();
            });
          }
          this.displayedColumns.forEach(column => {
            this.columnVisibility[column] = true; // Inicialmente todas las columnas visibles
          });
        }
      });
  }


  columnsFormGroup!: FormGroup;

  

  /*
  loadTableDataSelector__pre 15:25 del 16_2_24() {
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          // Función para eliminar caracteres no deseados de objetos anidados
          const removeBrackets = (value: any) => {
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value)
                .replace(/"|\[|\{/g, ' ')
                .replace(/\]|\}/g, '')


            } else {
              return value;
            }
          };

          // Mapear los objetos para convertir los objetos anidados a strings
          const modifiedData = data.map(item => {
            const modifiedItem: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              modifiedItem[key] = removeBrackets(item[key]);
            }
            return modifiedItem;
          });

          this.displayedColumns = Object.keys(modifiedData[0]);
          this.allColumns = Object.keys(modifiedData[0]);
          this.dataSource.data = modifiedData;
          this.dataSource.paginator = this.paginator;
          if (this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sort.sortChange.subscribe(() => {
              this.adjustSelectionAfterSort();
            });
          }
          this.displayedColumns.forEach(column => {
            this.columnVisibility[column] = true; // Inicialmente todas las columnas visibles
          });

          // Construir FormGroup dinámicamente
          const group: any = {};
          this.displayedColumns.forEach(column => {
            group[column] = new FormControl(true); // Todos inicialmente marcados como visibles
          });
          this.columnsFormGroup = this.formBuilder.group(group);

        }
      });
  }*/

  formatColumnName(columnName: string): string {
    // Reemplazar guiones bajos con espacios
    let formattedName = columnName.replace(/_/g, ' ');
    
    // Insertar espacios entre letras minúsculas y mayúsculas
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1 $2');
    
    // Convertir la primera letra de cada palabra a mayúscula
    formattedName = formattedName.replace(/\b\w/g, firstChar => firstChar.toUpperCase());
    
    return formattedName;
  }

  loadTableDataSelector() { // post 15:25 del 16_2_24
    this.http.get<any[]>(this.jsonLink)
      .subscribe(data => {
        if (data.length > 0) {
          // Función para eliminar caracteres no deseados de objetos anidados
          const removeBrackets = (value: any) => {
            if (typeof value === 'object' && value !== null) {
              return JSON.stringify(value)
                .replace(/"|\[|\{/g, ' ')
                .replace(/\]|\}/g, '');
            } else {
              return value;
            }
          };
  
          // Mapear los objetos para convertir los objetos anidados a strings
          const modifiedData = data.map(item => {
            const modifiedItem: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              modifiedItem[this.formatColumnName(key)] = removeBrackets(item[key]);
            }
            return modifiedItem;
          });
  
          this.displayedColumns = Object.keys(modifiedData[0]);
          this.allColumns = Object.keys(modifiedData[0]);
          this.dataSource.data = modifiedData;
          this.dataSource.paginator = this.paginator;
          if (this.sort) {
            this.dataSource.sort = this.sort;
            this.dataSource.sort.sortChange.subscribe(() => {
              this.adjustSelectionAfterSort();
            });
          }
          this.displayedColumns.forEach(column => {
            this.columnVisibility[column] = true; // Inicialmente todas las columnas visibles
          });
  
          // Construir FormGroup dinámicamente
          const group: any = {};
          this.displayedColumns.forEach(column => {
            group[column] = new FormControl(true); // Todos inicialmente marcados como visibles
          });
          this.columnsFormGroup = this.formBuilder.group(group);
        }
      });
  }
  








  adjustSelectionAfterSort() {
    if (this.dataSource.sort) {
      const newData = this.dataSource.sortData(this.dataSource.filteredData, this.dataSource.sort);
      const newSelection = [];
      for (const item of newData) {
        if (this.preSortSelection.has(item)) {
          newSelection.push(item);
        }
      }
      this.selection.clear();
      for (const item of newSelection) {
        this.selection.select(item);
      }
    }

  }

  sortChange(event: Sort) {
    this.deselectAllRows();
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
    if (this.selectedRowCount) {
      // Obtener todas las filas de la fuente de datos
      const allRows = this.dataSource.data;
      // Filtrar las filas que aún no están seleccionadas
      const unselectedRows = allRows.filter(row => !this.selection.isSelected(row));
      // Deseleccionar todas las filas previamente seleccionadas
      this.selection.clear();
      // Seleccionar todas las filas que no estaban seleccionadas previamente
      unselectedRows.forEach(row => this.selection.select(row));
    }
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

  testLog() {
    /*console.log("displayed: " + this.displayedColumns);
    console.log("hidden: " + this.hiddenColumns);
    //console.log('Selected Rows:', this.selection.selected);
    console.log(this.displayedColumns.length);
*/
    console.log(this.displayedColumns);

  }

  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  /*
    applyFilter(event: Event) {
      const filterValue = (event.target as HTMLInputElement).value;
      this.dataSource.filter = filterValue.trim().toLowerCase();
      if (this.dataSource.paginator) {
        this.dataSource.paginator.firstPage();
      }
    }
    */

  applyFilter(event: Event, columnName: string) {
    const filterValue = (event.target as HTMLInputElement).value;
    this.dataSource.filterPredicate = (data: any, filter: string) => {
      const dataStr = data[columnName].toLowerCase();
      return dataStr.indexOf(filter) !== -1;
    };
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }


  hiddenColumns: string[] = []; // Array para almacenar las columnas ocultas


  // Método para mostrar una columna oculta
  showColumn(column: string) {
    const index = this.hiddenColumns.indexOf(column);
    if (index !== -1) {
      this.hiddenColumns.splice(index, 1); // Eliminar la columna de las columnas ocultas
      //this.displayedColumns.push(column);
      this.displayedColumns.splice(0, 0, column); // Agregar la columna al principio del array
    }
  }


  hideColumn(column: string) { // hide column
    const index = this.displayedColumns.indexOf(column);
    if (index !== -1) {
      this.displayedColumns.splice(index, 1); // Eliminar la columna de las columnas ocultas
      this.hiddenColumns.push(column);
    }
  }

  toggleColumnVisibility(column: string) {
    const indexInDisplayed = this.displayedColumns.indexOf(column);
    const indexInHidden = this.hiddenColumns.indexOf(column);

    if (indexInDisplayed !== -1) {
      // La columna está actualmente visible, así que la ocultamos
      this.hideColumn(column);
      /*this.displayedColumns.splice(indexInDisplayed, 1);
      this.hiddenColumns.push(column);*/
    } else if (indexInHidden !== -1) {
      // La columna está actualmente oculta, así que la mostramos
      this.showColumn(column);
      /*this.hiddenColumns.splice(indexInHidden, 1);
      this.displayedColumns.push(column);*/
    }

  }


  /*

   // Mostrar u ocultar columnas según los checkboxes
   toggleColumnVisibilityNew(column: string) {
    const control = this.columnsFormGroup.get(column);
    if (control) {
      if (control.value) {
        // Si el checkbox está marcado, mostrar la columna
        this.showColumnCheck(column);
      } else {
        // Si el checkbox está desmarcado, ocultar la columna
        this.hideColumnCheck(column);
      }
    }
  }

  // Método para mostrar una columna
  showColumnCheck(column: string) {
    const index = this.hiddenColumns.indexOf(column);
    if (index !== -1) {
      this.hiddenColumns.splice(index, 1);
      this.displayedColumns.push(column);
    }
  }

  // Método para ocultar una columna
  hideColumnCheck(column: string) {
    const index = this.displayedColumns.indexOf(column);
    if (index !== -1) {
      this.displayedColumns.splice(index, 1);
      this.hiddenColumns.push(column);
    }
  }*/
















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
    let rowsToExport: any[] = [];

    // Verificar si hay elementos seleccionados
    if (this.selection.selected.length > 0) {
      // Si se han seleccionado elementos, exportar solo esos elementos
      rowsToExport = this.selection.selected;
    } else {
      // Si no hay elementos seleccionados, exportar toda la tabla
      rowsToExport = this.dataSource.data;
    }

    // Filtrar las columnas visibles para la exportación
    const visibleColumns = this.displayedColumns.filter(column => column !== 'select');

    // Obtener solo los nombres de las columnas visibles
    const headers = visibleColumns.map(column => column);

    // Crear una matriz para almacenar los datos de las filas seleccionadas
    const data: any[][] = [];
    data.push(headers);

    // Agregar datos de las filas seleccionadas
    rowsToExport.forEach(row => {
      const rowData = visibleColumns.map(column => row[column]);
      data.push(rowData);
    });

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Guardar el libro como archivo Excel
    XLSX.writeFile(workbook, 'table_data.xlsx');
  }








  exportToExcel__() {
    // Implementar la exportación a Excel aquí
    let rowsToExport: any[] = [];

    // Verificar si hay elementos seleccionados
    if (this.selection.selected.length > 0) {
      // Si se han seleccionado elementos, exportar solo esos elementos
      rowsToExport = this.selection.selected;
    } else {
      // Si no hay elementos seleccionados, exportar toda la tabla
      rowsToExport = this.dataSource.data;
    }

    // Filtrar las columnas visibles para la exportación
    const visibleColumns = this.displayedColumns.filter(column => column !== 'select');

    // Obtener solo los nombres de las columnas visibles
    const headers = visibleColumns.map(column => column);

    // Crear una matriz para almacenar los datos de las filas seleccionadas
    const data: any[][] = [];
    data.push(headers);

    // Agregar datos de las filas seleccionadas
    rowsToExport.forEach(row => {
      const rowData = visibleColumns.map(column => row[column]);
      data.push(rowData);
    });

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Guardar el libro como archivo Excel
    XLSX.writeFile(workbook, 'table_data.xlsx');
  }

  exportAllToExcel() {
    // Implementar la exportación de todos los datos a Excel aquí
    // Implementar la exportación a Excel aquí
    let rowsToExport: any[] = [];
    const visibleColumns = this.displayedColumns.filter(column => column !== 'select');
    // Obtener solo los nombres de las columnas visibles
    const headers = visibleColumns.map(column => column);

    // Crear una matriz para almacenar los datos de las filas seleccionadas
    const data: any[][] = [];
    data.push(headers);

    // Agregar datos de las filas seleccionadas
    rowsToExport.forEach(row => {
      const rowData = visibleColumns.map(column => row[column]);
      data.push(rowData);
    });

    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Guardar el libro como archivo Excel
    XLSX.writeFile(workbook, 'table_data.xlsx');
  }

  excelExport() {
    let rowsToExport: any[] = [];
    if (this.selection.selected.length > 0) {
      // Si se han seleccionado elementos, exportar solo esos elementos
      rowsToExport = this.selection.selected;
    } else {
      // Si no hay elementos seleccionados, exportar toda la tabla
      rowsToExport = this.dataSource.data;
    }
    // Filtrar las columnas visibles para la exportación

    const visibleColumns = this.displayedColumns.filter(column => column !== 'select');

    // Obtener solo los nombres de las columnas visibles
    const headers = visibleColumns.map(column => column);
    // Crear una matriz para almacenar los datos de las filas seleccionadas
    const data: any[][] = [];
    data.push(headers);
    // Agregar datos de las filas seleccionadas
    rowsToExport.forEach(row => {
      const rowData = visibleColumns.map(column => row[column]);
      data.push(rowData);
    });
    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);

    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');

    // Guardar el libro como archivo Excel
    XLSX.writeFile(workbook, 'table_data.xlsx');


  }




  getSelectedRowData() {
    // Implementar la lógica para obtener los datos de la fila seleccionada
    this.logSelectedRows();
  }





  sizeToFit() {
    // Implementar la lógica para ajustar el tamaño de las columnas
  }

  drop(event: CdkDragDrop<string[]>) {
    const previousIndex = this.displayedColumns.findIndex(col => col === event.item.data);
    const newIndex = event.currentIndex;
    const columnToMove = this.displayedColumns[previousIndex];

    // Mover la columna en el arreglo
    this.displayedColumns.splice(previousIndex, 1);
    this.displayedColumns.splice(newIndex, 0, columnToMove);
  }





}


