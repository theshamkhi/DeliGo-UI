import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Colis, StatutColis } from '../../core/models/colis.model';
import { PageResponse, PageRequest } from '../../core/models/pagination.model';

export const ColisActions = createActionGroup({
  source: 'Colis',
  events: {
    // Load All
    'Load Colis': props<{ pageRequest: PageRequest }>(),
    'Load Colis Success': props<{ response: PageResponse<Colis> }>(),
    'Load Colis Failure': props<{ error: string }>(),

    // Load One
    'Load Colis By Id': props<{ id: string }>(),
    'Load Colis By Id Success': props<{ colis: Colis }>(),
    'Load Colis By Id Failure': props<{ error: string }>(),

    // Search
    'Search Colis': props<{ keyword: string; pageRequest: PageRequest }>(),
    'Search Colis Success': props<{ response: PageResponse<Colis> }>(),
    'Search Colis Failure': props<{ error: string }>(),

    // Create
    'Create Colis': props<{ colis: Colis }>(),
    'Create Colis Success': props<{ colis: Colis }>(),
    'Create Colis Failure': props<{ error: string }>(),

    // Update
    'Update Colis': props<{ id: string; colis: Colis }>(),
    'Update Colis Success': props<{ colis: Colis }>(),
    'Update Colis Failure': props<{ error: string }>(),

    // Update Status (Optimistic)
    'Update Status': props<{ id: string; statut: StatutColis; commentaire?: string }>(),
    'Update Status Success': props<{ colis: Colis }>(),
    'Update Status Failure': props<{ error: string; originalColis: Colis }>(),

    // Delete
    'Delete Colis': props<{ id: string }>(),
    'Delete Colis Success': props<{ id: string }>(),
    'Delete Colis Failure': props<{ error: string }>(),

    // Assign Livreur
    'Assign Livreur': props<{ colisId: string; livreurId: string }>(),
    'Assign Livreur Success': props<{ colis: Colis }>(),
    'Assign Livreur Failure': props<{ error: string }>(),

    // Filters
    'Set Status Filter': props<{ status: StatutColis | null }>(),
    'Clear Filters': emptyProps(),

    // Selection
    'Select Colis': props<{ id: string }>(),
    'Clear Selection': emptyProps()
  }
});
