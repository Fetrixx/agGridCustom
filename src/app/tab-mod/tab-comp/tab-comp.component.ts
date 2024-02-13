import { Component, ViewChild } from '@angular/core';
import { ColDef, GridOptions, GridReadyEvent, GridApi } from 'ag-grid-community'; // Column Definition Type Interface
import { HttpClient, HttpClientModule } from '@angular/common/http';
import * as XLSX from 'xlsx';

import { AgGridAngular } from 'ag-grid-angular';

import { SelectionChangedEvent } from 'ag-grid-community';



@Component({
  selector: 'app-tab-comp',
  templateUrl: './tab-comp.component.html',
  styleUrl: './tab-comp.component.css',
  
})

export class TabCompComponent {

  
  private gridApi!: GridApi;
  gridOptions: GridOptions = {
    

  }

  selectedRowCount: number = 0;


  // sets 10 rows per page (default is 100)
  paginationPageSize = 20; //
  
  // allows the user to select the page size from a predefined list of page sizes
  paginationPageSizeSelector = [20, 50, 100];
  
  columnDefs: ColDef[] = [];
  rowData: any[] = [];
  

  constructor(private http: HttpClient) {}



  updateSelectedRowCount() {
    this.selectedRowCount = this.gridApi.getSelectedRows().length;
  }

  ngOnInit() {
    this.loadGridData();
  }

  loadGridData() {
    // json for test: https://hp-api.onrender.com/
    this.http.get<any[]>('https://hp-api.onrender.com/api/characters') // json file here
      .subscribe(data => {
        this.columnDefs = this.generateColumnDefs(data);
        this.rowData = data;
      });
  }

  


  private generateColumnDefs(data: any[]): ColDef[] {
    if (data.length === 0) {
      return [];
    }

    return Object.keys(data[0]).map(key => {
      return { headerName: key, field: key, filter:true, sortable: true, resizable: true, autoHeight: true}; //, valueParser:String
    });
  }

  
  exportToExcel() { // exportar seleccion
    const selectedData = this.getSelectedRowData();
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

  
  

  
  
  exportAllToExcel() {
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


  

  getSelectedRowData() {
    const selectedData = this.gridApi.getSelectedRows();
    console.log(selectedData);
    
    return selectedData;
  }

  onGridReady(params: GridReadyEvent) {
    this.gridApi = params.api;
    this.gridApi.addEventListener('selectionChanged', this.updateSelectedRowCount.bind(this));
  }

  
  sizeToFit(){
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








/*exportToExcel() {
    const fileName = 'exported_data.xlsx';
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(this.rowData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };
    XLSX.writeFile(workbook, fileName);
  }*/

  /*
  exportToExcel() { // exportar seleccion
    //const fileName = 'exported_data.xlsx';
    const now = new Date();
    const day = now.getDate().toString().padStart(2, '0');
    const month = (now.getMonth() + 1).toString().padStart(2, '0'); // Los meses comienzan desde 0
    const year = now.getFullYear().toString();
    const hours = now.getHours().toString().padStart(2, '0');
    const minutes = now.getMinutes().toString().padStart(2, '0');
    const seconds = now.getSeconds().toString().padStart(2, '0');
    const fileName = `Tabla Exportada ${day}-${month}-${year}  ${hours}.${minutes}.${seconds}.xlsx`;

    const selectedData = this.getSelectedRowData();
    const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(selectedData);
    const workbook: XLSX.WorkBook = { Sheets: { 'data': worksheet }, SheetNames: ['data'] };

    
    XLSX.writeFile(workbook, fileName);
  }
  */


/*
export class TabCompComponent {
  @ViewChild('agGrid') agGrid!: AgGridAngular;

  columnDefs = [];
  gridOptions = {
    columnDefs: this.columnDefs,
    enableSorting: true,
    enableFilter: true,
    pagination: true
  };

  constructor(private http: HttpClient) { }

  ngOnInit() {
    this.http.get('https://hp-api.onrender.com/api/characters') //link to json file
      .subscribe((data: any[]) => {
        const keys = Object.keys(data[0]);
        this.columnDefs = keys.map(key => ({ field: key }));
        this.gridOptions.api.setColumnDefs(this.columnDefs);        
        this.gridOptions.api.setRowData(data);
      });
  }




  
  /*
  // Row Data: The data to be displayed.
  rowData: any[] = [
    {name: 'name1', code: 'aa', price: 1000},
    {name: 'name2', code: 'aaa', price: 2000},
    {name: 'name3', code: 'bb', price: 3000},
    {name: 'name4', code: 'bbb', price: 4000},
    
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field:'', headerCheckboxSelection: true,
    checkboxSelection: true,
    showDisabledCheckboxes: true,
    width: 50, maxWidth: 50,
    lockPosition:'left',
    
    },
    
    { field: 'name', filter: true},
    { field: 'code', filter: true },
    { field: 'price', filter: true },
  ]
    //  suppressDragLeaveHidesColumns : true,
    
    
  ;

  // Load data into grid when ready
  

  /*
  themeClass = "ag-theme-material";
  // Row Data: The data to be displayed.
  rowData = [
    { make: "Tesla", model: "Model Y", price: 64950, electric: true },
    { make: "Ford", model: "F-Series", price: 33850, electric: false },
    { make: "Toyota", model: "Corolla", price: 29600, electric: false },
  ];

  // Column Definitions: Defines & controls grid columns.
  colDefs: ColDef[] = [
    { field: "make" },
    { field: "model" },
    { field: "price" },
    { field: "electric" }
  ];



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

  // the header of the default group column
  group: 'Grupo',

  // tool panel
  columns: 'Columnas',
  filters: 'Filtros',
  valueColumns: 'Valor de las Columnas',
  pivotMode: 'Modo Pivote',
  groups: 'Grupos',
  values: 'Valores',
  pivots: 'Pivotes',
  toolPanelButton: 'BotonDelPanelDeHerramientas',

  // other
  noRowsToShow: 'No hay filas para mostrar',

}

}
*/
