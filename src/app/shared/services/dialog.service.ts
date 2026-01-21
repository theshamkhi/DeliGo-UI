import { Injectable, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { ConfirmDialogComponent, ConfirmDialogData } from '../components/confirm-dialog/confirm-dialog';

@Injectable({
  providedIn: 'root'
})
export class DialogService {
  private dialog = inject(MatDialog);

  /**
   * Open a confirmation dialog
   */
  confirm(data: ConfirmDialogData): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '400px',
      data
    });

    return dialogRef.afterClosed();
  }

  /**
   * Open a delete confirmation dialog
   */
  confirmDelete(itemName: string): Observable<boolean> {
    return this.confirm({
      title: 'Confirmer la suppression',
      message: `Êtes-vous sûr de vouloir supprimer ${itemName}? Cette action est irréversible.`,
      confirmText: 'Supprimer',
      cancelText: 'Annuler',
      confirmColor: 'warn'
    });
  }

  /**
   * Open a generic action confirmation dialog
   */
  confirmAction(title: string, message: string, actionText: string = 'Confirmer'): Observable<boolean> {
    return this.confirm({
      title,
      message,
      confirmText: actionText,
      cancelText: 'Annuler',
      confirmColor: 'primary'
    });
  }
}
