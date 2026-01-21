import { Pipe, PipeTransform } from '@angular/core';
import { DatePipe } from '@angular/common';

@Pipe({
  name: 'dateFormat',
  standalone: true
})
export class DateFormatPipe implements PipeTransform {
  private datePipe = new DatePipe('fr-FR');

  transform(value: Date | string | number | null | undefined, format: string = 'medium'): string | null {
    if (!value) {
      return null;
    }

    // Custom formats
    switch (format) {
      case 'short':
        return this.datePipe.transform(value, 'dd/MM/yyyy');
      case 'medium':
        return this.datePipe.transform(value, 'dd/MM/yyyy HH:mm');
      case 'long':
        return this.datePipe.transform(value, 'dd MMMM yyyy à HH:mm');
      case 'time':
        return this.datePipe.transform(value, 'HH:mm');
      case 'date':
        return this.datePipe.transform(value, 'dd/MM/yyyy');
      default:
        return this.datePipe.transform(value, format);
    }
  }
}
