### Uso del Json:

typeValue:
    • string
    • check
    • number * 
    • date *
    • url
    • img
    • nestedObject
    • list

Pipes:
los pipes para elementos sin pipes custom son “” (comillas vacias) o “default” para no usar ningun pipe. * significa que este typeValue tienen pipes custom.

Pipes Custom:
- number: comma, percent, default, USD, GS 
    • comma (numero con separador de miles)
    • - percent (porcentaje, se escribe como: ej. 0.4 = 40)
    • - USD (representacion currency en dolares)
    • - GS (representacion currency en PYG)

- date: time, datetime, date, y todos los locale de angular
    • date: represenado como “dd-MM-yyyy”
    • time: represenado como “hh:mm:ss a”
    • datetime: represenado como “dd-MM-yyyy hh:mm:ss a”
    • todos los datepipes standard de angular “DatePipe”: https://angular.io/api/common/DatePipe

Si hay alguna configuracion incorrecta en el json, el elemento estara en italic bold.


En el json, no se admiten las mayusculas, en las keys, ejemplo:
correcto: 
{
	"numero_uno": 1
}
incorrecto: 
    • "numeroUno": 1
    • "NumeroUno": 1
    • "Uno": 1


# AppAgGrid

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.1.1.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory.

## Running unit tests

Run `ng test` to execute the unit tests via [Karma](https://karma-runner.github.io).

## Running end-to-end tests

Run `ng e2e` to execute the end-to-end tests via a platform of your choice. To use this command, you need to first add a package that implements end-to-end testing capabilities.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
