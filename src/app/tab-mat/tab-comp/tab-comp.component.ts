/*
ya esta:
* busqueda por columna multiple
* flexbox
* conversion de datos para mostrar
* archivo de config en el json
* formatear "date" para mostrar y filtrar correctamente:
* sticky header
* chips para busqueda por columna 

en proceso:
- flex correcto en tabla (ancho de cols) ?
formato para json config
"config""id": {"typeValue": "date", "pipe": "short", "columName": "#", "total": true},
- arreglar la seleccion con shift al aplicar un filtro
- arreglar sort al hacer el  filtro 
- todo lq tenga que ver con el nuevo filtro

falta: 
- multi sort (ngx-mat-multi-sort ?)
- pivot (?)




*/
import { Component, ViewChild, AfterViewInit, HostListener, Input, ViewChildren, QueryList, ElementRef } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GridApi, GridOptions, ColDef, GridReadyEvent } from 'ag-grid-community';

import {MatChipEditedEvent, MatChipEvent, MatChipInputEvent, MatChipsModule} from '@angular/material/chips';
import {MatFormFieldModule} from '@angular/material/form-field';
import {LiveAnnouncer} from '@angular/cdk/a11y';
import {COMMA, ENTER} from '@angular/cdk/keycodes';
import {inject} from '@angular/core';


@Component({
  selector: 'tabla-custom',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css'
})

//implements AfterViewInit
export class TabCompComponent {

  @Input() jsonLink: string = '';
  @Input() tipoTabla: string = '';


  displayedColumns: string[] = [];
  originalColumns: string[] = [];
  allColumns: string[] = [];
  dataSource: MatTableDataSource<any> = new MatTableDataSource<any>();
  selectedRowIndex = -1; // Inicialmente ninguna fila seleccionada
  selectedRowCount: number = 0;

  // workaround ngIf breaking paginato, sort...
  private paginator: MatPaginator | null = null;
  private sort: MatSort | null = null;

  @ViewChild(MatSort) set matSort(ms: MatSort) {
    this.sort = ms;
    this.setDataSourceAttributes();
  }

  @ViewChild(MatPaginator) set matPaginator(mp: MatPaginator) {
    this.paginator = mp;
    this.setDataSourceAttributes();
  }

  setDataSourceAttributes() {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  //@ViewChild(MatSort, { static: true }) sort: MatSort | null = null;
  //@ViewChild(MatPaginator, { static: true }) paginator: MatPaginator | null = null;

  selection = new SelectionModel<any>(true, []);
  private lastSelectedRowIndex: number | null = null; // propiedad para manejar la última fila seleccionada con Shift+Click
  private preSortSelection: Set<any[]> = new Set<any[]>(); // propiedad para almacenar las filas seleccionadas antes de la clasificación

  pageSizes: number[] = [10, 20, 50, 100];

  constructor(private http: HttpClient, private formBuilder: FormBuilder) { }

  ngAfterViewInit() {
    this.loadTableDataSelector();
    this.loadConfigData();
    //this.applyAllFilters(); // Aplicar filtros iniciales

    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.adjustSelectionAfterSort();
      });
    }

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

  columnVisibility: { [key: string]: boolean } = {};

  columnsFormGroup!: FormGroup;

  formatColumnName(columnName: string): string {
    // Reemplazar guiones bajos con espacios
    let formattedName = columnName.replace(/_/g, ' ');

    // Insertar espacios entre letras minúsculas y mayúsculas
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Convertir la primera letra de cada palabra a mayúscula
    formattedName = formattedName.replace(/\b\w/g, firstChar => firstChar.toUpperCase());

    return formattedName;
  }


  configColumnas: any[] = [];
  loadConfigData() {
    this.http.get<{ config: any[] }>(this.jsonLink) // get "config" de type any[] dentro del json
      .subscribe(data => {
        if (data && data.config && data.config.length > 0) {
          const configData = data.config;
          this.configColumnas = configData;
          //console.log(this.configColumnas[0].id);
          //console.log(this.configColumnas[0].wand);
          //console.log(this.configColumnas[0]['wand']);
          for (let i = 0; i < this.originalColumns.length; i++) { // si funca para leer 
            //console.log(this.configColumnas[0]['wand']);
            //console.log(this.configColumnas[0][this.originalColumns[i]]); // SI LEE
          }

          for (const columna of this.originalColumns) {
            //console.log(this.configColumnas[0][columna]); // SI LEE, da el dato de string, number, date, etc


          }

        }
      });
  }

  cellType(colId: string) {
    // col id es el nombre de la columna del item actual
    //console.log(this.originalColumns)
    //colId = colId.replace(/\s+/g, '').toLowerCase();
    const normalizedColId = colId.replace(/ /g, '').toLowerCase(); // Elimina espacios y convierte a minúsculas

    //colId = colId.toLowerCase();
    //colId.replace(/\s+/g , '');
    //console.log(colId);
    for (const col of this.configColumnas) {
      for (const key in col) {
        // Normaliza el nombre de la columna en el objeto de configuración
        const normalizedKey = key.replace(/ /g, '').toLowerCase();

        // Compara los nombres normalizados
        if (normalizedKey === normalizedColId) {
          const type = col[key];
          if (type === 'string') {
            return 'string';
          }
          else if (type === 'check') {
            return 'checkbox';
          }

          else if (type === 'number') {
            return 'number';
          }
          else if (type === 'number_miles') {
            return 'number_miles';
          }
          else if (type === 'date') {
            return 'date';
          }
          else if (type === 'datetime') {
            return 'datetime';
          }
          else if (type === 'time') {
            return 'time';
          }
          else if (type === 'url') {
            return 'url';
          }
          else if (type === 'img') {
            return 'img';
          }

        }
      }
    }
    return ''
  }

  testog() {
    console.log(this.originalColumns)
    console.log(this.configColumnas)
  }

  refresh() {
    this.hiddenColumns = [];
    // Limpiar los filtros
    this.filters = {};
    // Establecer el filtro de la tabla a un valor vacío
    this.dataSource.filter = '';
    // Reiniciar el ordenamiento de la tabla
    if (this.sort) {
      this.sort.active = '';
      this.sort.direction = '';
    }
    // Cargar los datos actualizados en la tabla
    this.loadTableDataSelector();
    this.deselectAllRows();

  }

  loadTableDataSelector() {
    this.http.get<{ data: any[] }>(this.jsonLink) // get "data" de type any[] dentro del json
      .subscribe(data => { // acceder a .data del item "data" del json
        if (data.data.length > 0) {
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
          const modifiedData = data.data.map(item => {                    // acceder a .data del item "data" del json
            const modifiedItem: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              modifiedItem[this.formatColumnName(key)] = removeBrackets(item[key]);
            }
            return modifiedItem;
          });

          const colsOriginales = data.data.map(item => {
            const originalItems: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              originalItems[key] = item[key];
            }
            return originalItems;
          })

          this.originalColumns = Object.keys(colsOriginales[0]);
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


  stopPropagation(event: MouseEvent) {
    event.stopPropagation();
  }

  filters: { [key: string]: string } = {};


  applyFilter(event: Event, columnName: string) {
    const filterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    //console.log("applyfilter: " + filterValue + " - type;" + typeof(filterValue))
    //console.log("filters: " + this.filters + " - filters at col;" + this.filters[columnName])
    this.filters[columnName] = filterValue;
    this.applyAllFilters();
  }



  busqueda: string = "";

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>; // Obtener referencia a los elementos input
  
  removeItem(event: MatChipEvent, item: string): void {
    console.log("this.busqueda antes  = "+this.busqueda)
    // Verificar si el filtro que se desea eliminar existe
    const deleteKey = item.split(":")[0].trim();
    //console.log("Before removal:", this.filters);
    if (this.filters.hasOwnProperty(deleteKey)) {
        // Eliminar el filtro específico
        delete this.filters[deleteKey];

      /*  // Limpiar el valor del input
      if (this.inputField && this.inputField.nativeElement) {
        this.inputField.nativeElement.value = '';
      }*/
        
        // Actualizar el filtro en el origen de datos
        this.dataSource.filter = JSON.stringify(this.filters);
        
        // Verificar si hay alguna búsqueda activ, filtros, asi se modifica "busqueda"
        this.busqueda = Object.values(this.filters).some(filter => filter !== "")
            ? Object.keys(this.filters)
                .map(key => `${key}: ${this.filters[key]}`)
                .join(", ")
            : "";

        // Limpiar el valor del input correspondiente
      const inputField = this.inputFields.find(input => input.nativeElement.id === `inputField_${deleteKey}`);
      if (inputField) {
        inputField.nativeElement.value = ''; // Establece el valor del input a una cadena vacía
      }
      console.log("this.busqueda dps = "+this.busqueda)
    }
    //console.log("After removal:", this.filters);
    //console.log("Current busqueda:", this.busqueda);    
  }

  eraseAllFilters(){
    // Limpiar el objeto this.filters eliminando propiedades vacías o nulas
    for (const key in this.filters) {
      delete this.filters[key];
    }

    this.dataSource.filter = JSON.stringify(this.filters);
    // Verificar si hay alguna búsqueda activa
    this.busqueda = Object.values(this.filters).some(filter => filter !== "")
    ? Object.keys(this.filters)
        .map(key => `${key}: ${this.filters[key]}`)
        .join(", ")
    : "";

  }

  applyAllFilters() {
    this.dataSource.filterPredicate = (data: any) => {
      for (const key in this.filters) {
        //console.log(this.filters[key])
        if (this.filters[key] !== null && this.filters[key] !== "") { // Solo aplicar filtro si no es null ni una cadena vacía
          if (data[key] === null) {
            return false; // Omitir si hay un dato null
          } else {
            if (this.filters[key] && data[key].toString().toLowerCase().indexOf(this.filters[key]) === -1) {
              return false; // No se cumple uno de los filtros, no mostrar esta fila
            }
          }
        }
      }
      return true; // Se cumplen todos los filtros, mostrar esta fila
    };

    // Limpiar el objeto this.filters eliminando propiedades vacías o nulas
    for (const key in this.filters) {
      if (this.filters[key] === '' || this.filters[key] === null) {
        delete this.filters[key];
      }
    }

    this.dataSource.filter = JSON.stringify(this.filters);
    // Verificar si hay alguna búsqueda activa
    this.busqueda = Object.values(this.filters).some(filter => filter !== "")
    ? Object.keys(this.filters)
        .map(key => `${key}: ${this.filters[key]}`)
        .join(", ")
    : "";



    console.log(this.busqueda);

  }


  hiddenColumns: string[] = []; // Array para almacenar las columnas ocultas


  // Método para mostrar una columna oculta
  showColumn(column: string) {
    const index = this.hiddenColumns.indexOf(column);
    if (index !== -1) {
      this.hiddenColumns.splice(index, 1); // Eliminar la columna de las columnas ocultas
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
    } else if (indexInHidden !== -1) {
      // La columna está actualmente oculta, así que la mostramos
      this.showColumn(column);
    }

  }


  refreshColumnVisibility(column: string) {
    const indexInDisplayed = this.displayedColumns.indexOf(column);
    const indexInHidden = this.hiddenColumns.indexOf(column);

    this.hideColumn
    if (indexInHidden !== -1) {
      // La columna está actualmente oculta, así que la mostramos
      this.showColumn(column);

      if (indexInHidden !== -1) {
        this.displayedColumns.splice(indexInHidden, 1); // Eliminar la columna de las columnas ocultas
        //this.hiddenColumns.push(column);
      }

    }

  }

  excelExport() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const fileName = `Tabla Exportada ${day}-${month}-${year}  ${hours}.${minutes}.${seconds}.xlsx`;
  
    let rowsToExport: any[] = [];
    if (this.selection.selected.length > 0) {
      // Si se han seleccionado elementos, exportar solo esos elementos
      rowsToExport = this.selection.selected;
    } else {
      // Si no hay elementos seleccionados, exportar toda la tabla
      rowsToExport = this.dataSource.filteredData; // Cambia dataSource.data a dataSource.filteredData
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
      const rowData = visibleColumns.map(column =>{
        // Si la celda es de tipo fecha, hora o fecha y hora, formatearla como texto
        if (this.cellType(column) === 'date') {
          return this.formatDate(row[column]);
        }
        else if (this.cellType(column) === 'time') {
          return this.formatTime(row[column]);
        }
        else if (this.cellType(column) === 'datetime') {
          return this.formatDateTime(row[column]);
        }
        else {
          return row[column];
        }
        });
      data.push(rowData);
    });
    // Crear un libro de Excel
    const workbook = XLSX.utils.book_new();
    const worksheet = XLSX.utils.aoa_to_sheet(data);
  
    // Agregar la hoja al libro
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Datos de Tabla');
  
    // Guardar el libro como archivo Excel
    XLSX.writeFile(workbook, fileName);
  }
  

  // Métodos de formato para fechas y horas
  formatDate(value: any): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    
    if (value !== null){
      const _date = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} `;
      return _date;      
    }
    return 'error'
  }
  
  formatTime(value: any): string {
    const date = new Date(value);
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (value !== null){
      const _time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return _time;
    }
    return 'error'

  }
  
  formatDateTime(value: any): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();
    
    if (value !== null){
      const _datetime = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}  ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return _datetime ;
    }
    return 'error'
  }
  

  drop(event: CdkDragDrop<string[]>) {
    const previousIndex = this.displayedColumns.findIndex(col => col === event.item.data);
    const newIndex = event.currentIndex;
    const columnToMove = this.displayedColumns[previousIndex];

    // Mover la columna en el arreglo
    this.displayedColumns.splice(previousIndex, 1);
    this.displayedColumns.splice(newIndex, 0, columnToMove);
  }


  // ---------------------------------------------------------------------------------- AG GRID SECTION ---------------------------------------------------------------------------------- 

  /*
  displayedColumns: string[] = [];
  dataSource: any[] = [];
  selectedRowCount: number = 0;
  */


  private gridApi!: GridApi;
  gridOptions: GridOptions = {}

  // sets 10 rows per page (default is 100)
  paginationPageSize = 20; //

  // allows the user to select the page size from a predefined list of page sizes
  paginationPageSizeSelector = [20, 50, 100];

  columnDefs: ColDef[] = [];
  rowData: any[] = [];


  updateSelectedRowCount_Ag() {
    this.selectedRowCount = this.gridApi.getSelectedRows().length;
  }

  ngOnInit() {
    this.loadGridData_Ag();
  }

  loadGridData_Ag() {
    // json for test: https://hp-api.onrender.com/

    this.http.get<{ data: any[] }>(this.jsonLink) // json file here
      .subscribe(data => {
        this.columnDefs = this.generateColumnDefs_Ag(data.data);
        this.rowData = data.data;
      });
  }




  private generateColumnDefs_Ag(data: any[]): ColDef[] {
    if (data.length === 0) {
      return [];
    }

    return Object.keys(data[0]).map(key => {
      return { headerName: key, field: key, filter: true, sortable: true, resizable: true, autoHeight: true }; //, valueParser:String
    });
  }


  exportToExcel_Ag() { // exportar seleccion
    const selectedData = this.getSelectedRowData_Ag();
    if (selectedData.length === 0) {
      alert("No se han seleccionado elementos para exportar.");
      return;
    }

    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const fileName = `Tabla Exportada ${day}-${month}-${year}  ${hours}.${minutes}.${seconds}.xlsx`;

    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    XLSX.writeFile(workbook, fileName);
  }






  exportAllToExcel_Ag() {
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const fileName = `Tabla Exportada ${day}-${month}-${year}  ${hours}.${minutes}.${seconds}.xlsx`;
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rowData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, fileName);

    this.gridApi.exportDataAsExcel
  }


  getSelectedRowData_Ag() {
    const selectedData = this.gridApi.getSelectedRows();
    //console.log(selectedData);
    return selectedData;
  }

  onGridReady_Ag(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.addEventListener('selectionChanged', this.updateSelectedRowCount_Ag.bind(this));
  }


  sizeToFit_Ag() {
    this.gridApi.autoSizeAllColumns(); // <-- Autoajuste de columnas al cargar el grid
  }






  ag_Grid_Locale_es = {
    // for filter panel
    page: 'Página',
    more: 'Más',
    to: 'a',
    of: 'de',
    next: 'Siguente',
    last: 'Último',
    first: 'Primero',
    previous: 'Anterior',
    loadingOoo: 'Cargando...',

    // for set filter
    selectAll: 'Seleccionar Todo',
    searchOoo: 'Buscar...',
    blank: 'En blanco',
    notBlank: 'No en blanco',

    // for number filter and text filter
    filterOoo: 'Filtrar',
    applyFilter: 'Aplicar Filtro...',
    equals: 'Igual',
    notEqual: 'No Igual',

    // for number filter
    lessThan: 'Menos que',
    greaterThan: 'Mayor que',
    lessThanOrEqual: 'Menos o igual que',
    greaterThanOrEqual: 'Mayor o igual que',
    inRange: 'En rango de',

    // for text filter
    contains: 'Contiene',
    notContains: 'No contiene',
    startsWith: 'Empieza con',
    endsWith: 'Termina con',

    // filter conditions
    andCondition: 'Y',
    orCondition: 'O',

    // other
    noRowsToShow: 'No hay filas para mostrar',

  }

}


