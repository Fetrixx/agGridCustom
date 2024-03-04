/*
ya esta:
* busqueda por columna multiple
* flexbox
* conversion de datos para mostrar
* archivo de config en el json
* formatear "date" para mostrar y filtrar correctamente:
* sticky header
* chips para busqueda por columna 
* al exportar, algunos datos estan mal formateados: alt name,birth date(null), wand
* al exportar, adaptar los formatos nuevos del json, como los de date, guiarse por celltype
birth date cuando es null da error, ver format time para guiarse, 
* totales para valores numericos que sean true
? arreglar la seleccion con shift al aplicar un filtro
? arreglar sort al hacer el  filtro 
? todo lq tenga que ver con el nuevo filtro

ya?:
? flex correcto en tabla (ancho de cols) ? (cuando la tabla tiene muchas columnas, parece que no tiene flex)

en proceso:
- calcula los datos  numericos, manejar edgeCases, en caso de que el valor no sea numerico.
- (total de todos?, en pantalla? seleccionados?)
- formato para json config
  "config" ["id": {"total": true},] (funciona si el valor es numerico)
- agregar usd o gs, verificando pipe ?

falta: 
- multi sort (ngx-mat-multi-sort ?)
- pivot (?)



eliminar los "format" que no se usen
- agregar inputs en las casillas al hacer hover en campos



-eventos, carga json rxjs



*/
import { Component, ViewChild, AfterViewInit, HostListener, Input, ViewChildren, QueryList, ElementRef, EventEmitter, Output } from '@angular/core';
import { SelectionModel } from '@angular/cdk/collections';
import { HttpClient } from '@angular/common/http';
import * as XLSX from 'xlsx';
import { MatTableDataSource } from '@angular/material/table';
import { MatSort, Sort } from '@angular/material/sort';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { FormBuilder, FormControl, FormGroup } from '@angular/forms';
import { GridApi, GridOptions, ColDef, GridReadyEvent } from 'ag-grid-community';

import { MatChipEditedEvent, MatChipEvent, MatChipInputEvent, MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { LiveAnnouncer } from '@angular/cdk/a11y';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { inject } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';


interface ColumnConfig {
  [key: string]: {
    typeValue: string;
    pipe: string;
    columnName: string;
    total: boolean;
  };
}


@Component({
  selector: 'tabla-custom',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css'
})

//implements AfterViewInit
export class TabCompComponent {

  @Input() jsonLink: string = '';
  @Input() tipoTabla: string = '';

  isHidden= false;
  showInput= false;

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

  @Input() pageSizes: number[] = [10, 20, 50, 100, 500]; // <- valor predefinido, en caso de no ser especificado
  @Input() pageSize: number = 20; // <- valor predefinido, en caso de no ser especificado

  @Output() rowEvent: EventEmitter<any> = new EventEmitter<any>();

  constructor(private http: HttpClient, private formBuilder: FormBuilder, private datePipe: DatePipe, private decimalPipe: DecimalPipe) { }

  ngAfterViewInit() {
    this.loadTableDataSelector();
    this.loadConfigData();
    //this.applyAllFilters(); // Aplicar filtros iniciales

    if (this.sort) {
      this.sort.sortChange.subscribe(() => {
        this.adjustSelectionAfterSort();
      });
    }
    this.calcularTotal()

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
      const start = Math.min(this.lastSelectedRowIndex, this.dataSource.filteredData.indexOf(row));
      const end = Math.max(this.lastSelectedRowIndex, this.dataSource.filteredData.indexOf(row));
      for (let i = start; i <= end; i++) {
        this.selection.select(this.dataSource.filteredData[i]);
      }
    } else {
      // Si no hay teclas especiales, seleccionar solo la fila
      this.selection.clear();
      this.selection.select(row);
    }
    // Actualizar el índice de la última fila seleccionada y almacenar la selección antes de la clasificación
    this.lastSelectedRowIndex = this.dataSource.filteredData.indexOf(row);
    this.preSortSelection = new Set(this.selection.selected);
    this.updateSelectedRowCount()
  }

  dbClick(row: any[], e: MouseEvent) {
    this.rowEvent.emit("\nROW: \n" + this.nestedToString(row));
  }

  columnVisibility: { [key: string]: boolean } = {};

  columnsFormGroup!: FormGroup;

  /*
  formatColumnName(columnName: string): string {
    // Reemplazar guiones bajos con espacios
    let formattedName = columnName.replace(/_/g, ' ');

    // Insertar espacios entre letras minúsculas y mayúsculas
    formattedName = formattedName.replace(/([a-z])([A-Z])/g, '$1 $2');

    // Convertir la primera letra de cada palabra a mayúscula
    formattedName = formattedName.replace(/\b\w/g, firstChar => firstChar.toUpperCase());

    return formattedName;
  }
  */


  configColumnas: any[] = [];
  loadConfigData() {
    this.http.get<{ config: ColumnConfig[] }>(this.jsonLink) // get "config" de type any[] dentro del json
      .subscribe(data => {
        if (data && data.config && data.config.length > 0) {
          const configData = data.config;
          this.configColumnas = configData;
        }
      });

  }

  /*calculateTotalPrices() {
    const config = jsonL.config;
    const data = json.data;

    const totalField = config.find(field => field.price.total === true)?.id;
    if (totalField) {
      this.totalPrices = data.reduce((total, item) => {
        if (item[totalField] === 'price') {
          return total + item.price;
        }
        return total;
      }, 0);
    }
  }*/

  totalesCols: any[] = [];


  cargarTotales() {
    if (this.totalesCols.length === 0) {
      this.http.get<{ config: any[], data: any[] }>(this.jsonLink) // get "data" y config de type any[] dentro del json
        .subscribe(response => { // acceder a .data del item "data" del json
          const config = response.config;
          const data = response.data;
          for (const col of this.configColumnas) {
            for (const key in col) {
              this.totalesCols.push({ name: config[0][key].columnName, total: 0 });
            }
          }
          //console.log("CREADO ARRAY TOTALES")
          //console.log(this.totalesCols)
        });
    }
    //console.log("ARRAY EXISTENTES TOTALES")
    //console.log(this.totalesCols)
  }

  calcularTotal() {
    if (this.totalesCols.length === 0) {
      this.cargarTotales();
    }

    this.http.get<{ config: any[], data: any[] }>(this.jsonLink) // get "data" y config de type any[] dentro del json
      .subscribe(response => { // acceder a .data del item "data" del json
        const config = response.config;
        const data = response.data;

        for (const col of this.configColumnas) {
          for (const key in col) {
            if (config[0][key].total) { // si hay alguno con valor true
              let _total = 0;

              for (const item of data) { // Recorre todos los elementos de data
                if (item[key] !== "" && item[key] !== null) {
                  _total += item[key]; // Suma el valor correspondiente a la clave key de cada elemento
                }
              }
              //_total += data[0][key]; //tomar valor
              // AGREGAR EL KEY QUE ES TRUE A UNA LISTA, Y SACAR SU TOTAL, EJEMPLO "YEAR": {"total": true}, "YEAR": 
              //this.totalesCols.findIndex(total => total.name === config[0][key].columnName + " total")  
              const existingTotalIndex = this.totalesCols.findIndex(total => total.name === config[0][key].columnName);
              if (existingTotalIndex !== -1) {
                this.totalesCols[existingTotalIndex].total += _total;
              } else {
                this.totalesCols.push({ name: config[0][key].columnName, total: _total });
              }

              //console.log(config[0][key]); // objeto de config
              //console.log(data[0][key]); // tomar el valor de data y agregarlo a una lista "totales"
              //this.totalesCols
            }

            //this.totalesCols.push({ name: config[0][key].columnName + " total", total: _total });
          }
        }

        /*for (const col of this.totalesCols) {
          for (const key in col) {
            //console.log("key: "+ key)
            //console.log("col[key]: " + col[key] + "type: " + typeof(col[key]));
            if (typeof (col[key]) === "number" && col[key] > "0") { // si en totalesCols, en el key "totales", hay un valor dif a 0
              console.log("valor: " + col[key])
              let colName: string = "";
              const valor = col[key];
              for (const col of this.configColumnas) {
                for (const key in col) {
                  if (config[0][key].total) { // si hay alguno con valor true
                    colName = config[0][key].columnName;
                  }
                }
              }

              this.totalesFinal.push(colName + ": " + valor + "");
            }
          }
        }*/

        for (const total of this.totalesCols) {
          if (typeof total.total === "number" && total.total !== 0) {
            //this.totalesFinal.push(`${total.name}: ${total.total}`);
            const formattedValue = this.decimalPipe.transform(total.total,'1.0')
            
            this.totalesFinal.push(total.name + ": " + formattedValue);

            //const formattedDate = this.datePipe.transform(row[column], 'date');
            
          }
        }


        //console.log(this.totalesFinal);
      });
  }

  totalesFinal: any[] = []

  cellType(colId: string): string {
    // Encuentra el key correspondiente al columnName
    const columnNameToFind = colId; // Modifica esto según el columnName que buscas
    const keyFound = this.findKeyByColumnName(this.configColumnas, columnNameToFind);

    // Si no se encuentra el key, devuelve una cadena vacía
    if (!keyFound) {
      return 'no se encontro el valor key';
    }

    for (const col of this.configColumnas) {
      // Itera sobre las propiedades del objeto de configuración de columna
      for (const key in col) {
        // Normaliza el nombre de la columna en el objeto de configuración
        const normalizedKey = key.replace(/ /g, '').toLowerCase();
        // Compara los nombres normalizados
        if (normalizedKey === keyFound) { // Compara con el key encontrado
          const type = col[key];
          // Verifica si se define el tipo de valor en la configuración
          if (type && type.typeValue) {
            // Devuelve el tipo de valor definido en la configuración
            if (type.typeValue === 'string') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'string';
              }
            }
            else if (type.typeValue === 'check') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'checkbox';
              }
            }

            else if (type.typeValue === 'number') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'number';
              }
              else if (type.pipe === 'comma') {
                return 'number_miles';
              }
              else if (type.pipe === 'percent') {
                return 'percent';
              }
              else if (type.pipe === 'USD') {
                return 'USD';
              }
              else if (type.pipe === 'GS') {
                return 'GS';
              }
            }
            /*else if (type.typeValue === 'number_miles') {
              return 'number_miles';
            }*/
            else if (type.typeValue === 'date') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'date'; //default
              }
              else if (type.pipe === 'date') {
                return 'date';
              }
              else if (type.pipe === 'time') {
                return 'time';
              }
              else if (type.pipe === 'datetime') {
                return 'datetime';
              }
              else if (type.pipe === 'short') {
                return 'short';
              }
              else if (type.pipe === 'medium') {
                return 'medium';
              }
              else if (type.pipe === 'long') {
                return 'long';
              }
              else if (type.pipe === 'full') {
                return 'full';
              }
              else if (type.pipe === 'shortDate') {
                return 'shortDate';
              }
              else if (type.pipe === 'mediumDate') {
                return 'mediumDate';
              }
              else if (type.pipe === 'longDate') {
                return 'longDate';
              }
              else if (type.pipe === 'fullDate') {
                return 'fullDate';
              }
              else if (type.pipe === 'shortTime') {
                return 'shortTime';
              }
              else if (type.pipe === 'mediumTime') {
                return 'mediumTime';
              }
              else if (type.pipe === 'longTime') {
                return 'longTime';
              }
              else if (type.pipe === 'fullTime') {
                return 'fullTime';
              }

              else { // si pipe es "" , default
                return 'date'
              }
            }
            else if (type.typeValue === 'url') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'url';
              }
              return 'url';
            }
            else if (type.typeValue === 'img') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'img';
              }
              return 'img';
            }
            else if (type.typeValue === 'nestedObject') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'nestedObject';
              }
              return 'nestedObject';
            }
            else if (type.typeValue === 'list') {
              if (type.pipe === 'default' || type.pipe === '') {
                return 'nestedObject';
              }
              return 'nestedObject';
            }
            //return type.typeValue;
          }
        }
      }
    }

    // Devuelve una cadena vacía si no se encuentra el tipo de valor para la columna
    return '';
  }

  nestedToString(val: any) {
    return JSON.stringify(val).replace(/"|\[|\{/g, ' ').replace(/\]|\}/g, '');
  }

  findKeyByColumnName(config: any[], columnName: string): string | undefined {
    for (const item of config) {
      for (const key in item) {
        if (item[key].columnName === columnName) {
          return key;
        }
      }
    }

    return undefined; // Si no se encuentra el columnName
  }

  columnNameJson(colId: string): string {
    const normalizedColId = colId.replace(/ /g, '').toLowerCase();
    for (const col of this.configColumnas) {
      // Itera sobre las propiedades del objeto de configuración de columna
      for (const key in col) {
        // Normaliza el nombre de la columna en el objeto de configuración
        const normalizedKey = key.replace(/ /g, '').toLowerCase();
        // Compara los nombres normalizados
        if (normalizedKey === normalizedColId) {
          const columnConfig = col[key];
          // Verifica si se define el tipo de valor en la configuración
          if (columnConfig && columnConfig.typeValue) {
            // Devuelve el tipo de valor definido en la configuración
            return columnConfig.columnName;
          }
        }
      }
    }

    // Devuelve una cadena vacía si no se encuentra el tipo de valor para la columna
    return '';
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
    this.eraseAllFilters();
  }

  loadTableDataSelector() {
    this.http.get<{ config: any[], data: any[] }>(this.jsonLink) // get "data" y config de type any[] dentro del json
      .subscribe(response => { // acceder a .data del item "data" del json
        if (response.data.length > 0) {
          // Función para formatear objetos anidados, listas a strings.
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
          const modifiedData = response.data.map(item => {                    // acceder a .data del item "data" del json
            const modifiedItem: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              modifiedItem[key] = removeBrackets(item[key]);
            }
            return modifiedItem;
          });

          const columnConfig = response.config[0]; // Se asume que solo hay un objeto de configuración
          const colNameData = response.data.map(item => {
            const colNameItem: { [key: string]: any } = {};
            for (const key in item) {
              const columnName = columnConfig[key]?.columnName || key;
              colNameItem[columnName] = item[key];
            }
            return colNameItem;
          });

          const colsOriginales = response.data.map(item => {
            const originalItems: { [key: string]: any } = {}; // Declaración de tipo
            for (const key in item) {
              originalItems[key] = item[key];
            }
            return originalItems;
          })
          this.originalColumns = Object.keys(colsOriginales[0]);
          this.displayedColumns = Object.keys(colNameData[0]);
          this.allColumns = Object.keys(modifiedData[0]);
          this.dataSource.data = colNameData;
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
      this.lastSelectedRowIndex = this.dataSource.filteredData.indexOf(newSelection[newSelection.length - 1]);
    }

  }

  resetSortAndSelection() {
    // Restablecer el orden de clasificación
    if (this.sort) {
      this.sort.active = '';
      this.sort.direction = '';
    }

    // Limpiar la selección
    this.selection.clear();
    this.lastSelectedRowIndex = null;
    this.preSortSelection.clear();
    this.selectedRowCount = 0;
  }

  pageSizeChange() {
    // Llama al método resetSortAndSelection
    this.resetSortAndSelection();
  }

  sortChange(event: Sort) {
    this.deselectAllRows();
  }

  // Seleccion inversa
  selectAllUnselectedRows() {
    if (this.selectedRowCount) {
      // Obtener todas las filas de la fuente de datos
      const allRows = this.dataSource.filteredData;
      // Filtrar las filas que aún no están seleccionadas
      const unselectedRows = allRows.filter(row => !this.selection.isSelected(row));
      // Deseleccionar todas las filas previamente seleccionadas
      this.selection.clear();
      // Seleccionar todas las filas que no estaban seleccionadas previamente
      unselectedRows.forEach(row => this.selection.select(row));
    }
    this.updateSelectedRowCount()
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
    this.filters[columnName] = filterValue;
    this.applyAllFilters();
  }

  busqueda: string = "";

  @ViewChildren('inputField') inputFields!: QueryList<ElementRef>; // Obtener referencia a los elementos input

  removeItem(event: MatChipEvent, item: string): void {
    // Verificar si el filtro que se desea eliminar existe
    const deleteKey = item.split(":")[0].trim();
    if (this.filters.hasOwnProperty(deleteKey)) {
      // Eliminar el filtro específico
      delete this.filters[deleteKey];

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
    }
    this.resetSortAndSelection();
  }

  eraseAllFilters() {
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
    // Restablecer el orden de clasificación y la selección antes de aplicar los filtros
    this.resetSortAndSelection();

    this.dataSource.filterPredicate = (data: any) => {
      for (const key in this.filters) {
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
      const rowData = visibleColumns.map(column => {
        //const formattedDate = this.datePipe.transform(row[column], 'date');
        //const formattedDate = this.datePipe.transform(FECHA.DATE, 'dd/MM/yyyy');

        // Si la celda es de tipo fecha, hora o fecha y hora, formatearla como texto
        if (this.cellType(column) === 'date') {
          if (row[column] !== null) { // custom
            //return this.datePipe.transform(row[column], 'date'); // es custom, no es datepipe
            return this.formatDate(row[column]);
          }
          return ""
        }
        else if (this.cellType(column) === 'time') { // custom
          if (row[column] !== null) { // custom
            return this.formatTime(row[column]);
          }
          return ""
        }
        else if (this.cellType(column) === 'datetime') {  // custom
          //return this.datePipe.transform(row[column], 'datetime');
          if (row[column] !== null) { // custom
            return this.formatDateTime(row[column]);
          }
          return ""
        }
        else if (this.cellType(column) === 'short') { // datepipe 
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'short');
          }
          return ""
        }
        else if (this.cellType(column) === 'medium') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'medium');
          }
          return ""
        }
        else if (this.cellType(column) === 'long') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'long');
          }
          return ""
        }
        else if (this.cellType(column) === 'full') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'full');
          }
          return ""
        }
        else if (this.cellType(column) === 'shortDate') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'shortDate');
          }
          return ""
        }
        else if (this.cellType(column) === 'mediumDate') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'mediumDate');
          }
          return ""
        }
        else if (this.cellType(column) === 'longDate') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'longDate');
          }
          return ""
        }
        else if (this.cellType(column) === 'fullDate') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'fullDate');
          }
          return ""
        }
        else if (this.cellType(column) === 'shortTime') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'shortTime');
          }
          return ""
        }
        else if (this.cellType(column) === 'mediumTime') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'mediumTime');
          }
          return ""
        }
        else if (this.cellType(column) === 'longTime') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'longTime');
          }
          return ""
        }
        else if (this.cellType(column) === 'fullTime') {
          if (row[column] !== null) {
            return this.datePipe.transform(row[column], 'fullTime');
          }
          return ""
        }

        else if (this.cellType(column) === 'nestedObject') {
          if (row[column] !== null) {
            return this.nestedToString(row[column]);
          }
          return ""
        }
        else if (this.cellType(column) === 'list') {
          if (row[column] !== null) {
            return this.nestedToString(row[column]);
          }
          return ""
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

    if (value !== null) {
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

    if (value !== null) {
      const _time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return _time;
    }
    // EJEMPLO EDGE CASE QUE SEA VALOR NULL
    return ''

  }

  formatDateTime(value: any): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (value !== null) {
      const _datetime = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}  ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
      return _datetime;
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
    switch (this.tipoTabla) {
      case "tab_nativa":
        break;
      case "tab_aggrid":
        this.loadGridData_Ag();
        break;
      default:
        break;
    }
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


