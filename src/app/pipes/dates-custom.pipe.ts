import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'datesCustom'
})
export class DatesCustomPipe implements PipeTransform {

  transform(value: string, format: string): string {
    const date = new Date(value);
    const year = date.getFullYear();
    const month = date.getMonth() + 1;
    const day = date.getDate();
    const hours = date.getHours();
    const minutes = date.getMinutes();
    const seconds = date.getSeconds();

    if (value !== null){
      switch (format){
        case 'date': 
          const _date = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year} `;
          return _date;
        case 'datetime': 
          const _datetime = `${day.toString().padStart(2, '0')}-${month.toString().padStart(2, '0')}-${year}  ${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          return _datetime ;
        
        case 'time': 
          const _time = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
          return _time;
        case 'dma': 
  
        case 'short': 
  
      }
      return "...tipo incorrecto."
    }
    return 'sin fecha.'
    
    //`${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}${timezoneOffset < 0 ? '-' : '+'}${Math.abs(timezoneOffset / 60).toString().padStart(2, '0')}:${(timezoneOffset % 60).toString().padStart(2, '0')}`;
    //return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}T${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}.${milliseconds.toString().padStart(3, '0')}${timezoneOffset < 0 ? '-' : '+'}${Math.abs(timezoneOffset / 60).toString().padStart(2, '0')}:${(timezoneOffset % 60).toString().padStart(2, '0')}`;
    
  }
}

