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

  displayedColumns: string[] = [];
  dataSource: any[] = [];
  selectedRowCount: number = 0;

  
  private gridApi!: GridApi;
  gridOptions: GridOptions = {
  
  }



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






