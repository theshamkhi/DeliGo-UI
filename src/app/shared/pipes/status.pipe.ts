import { Pipe, PipeTransform } from '@angular/core';
import { StatutColis } from '../../core/models/colis.model';

@Pipe({
  name: 'statusLabel',
  standalone: true
})
export class StatusLabelPipe implements PipeTransform {
  private statusLabels: Record<string, string> = {
    'EN_ATTENTE': 'En Attente',
    'EN_TRANSIT': 'En Transit',
    'LIVRE': 'Livré',
    'ANNULE': 'Annulé',
    'RETOURNE': 'Retourné'
  };

  transform(value: StatutColis | string | null | undefined): string {
    if (!value) {
      return 'Inconnu';
    }
    return this.statusLabels[value] || value;
  }
}

@Pipe({
  name: 'priorityLabel',
  standalone: true
})
export class PriorityLabelPipe implements PipeTransform {
  private priorityLabels: Record<string, string> = {
    'BASSE': 'Basse',
    'NORMALE': 'Normale',
    'HAUTE': 'Haute',
    'URGENTE': 'Urgente'
  };

  transform(value: string | null | undefined): string {
    if (!value) {
      return 'Normale';
    }
    return this.priorityLabels[value] || value;
  }
}
