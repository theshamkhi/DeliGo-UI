import { createFeatureSelector, createSelector } from '@ngrx/store';
import { ColisState, colisAdapter } from './colis.reducer';
import { StatutColis } from '../../core/models/colis.model';

export const selectColisState = createFeatureSelector<ColisState>('colis');

// Entity Selectors
const { selectAll, selectEntities, selectIds, selectTotal } =
  colisAdapter.getSelectors(selectColisState);

export const selectAllColis = selectAll;
export const selectColisEntities = selectEntities;
export const selectColisIds = selectIds;
export const selectColisTotal = selectTotal;

// UI State Selectors
export const selectColisLoading = createSelector(
  selectColisState,
  (state) => state.loading
);

export const selectColisError = createSelector(
  selectColisState,
  (state) => state.error
);

export const selectTotalElements = createSelector(
  selectColisState,
  (state) => state.totalElements
);

export const selectCurrentPage = createSelector(
  selectColisState,
  (state) => state.currentPage
);

export const selectStatusFilter = createSelector(
  selectColisState,
  (state) => state.statusFilter
);

// Selected Colis
export const selectSelectedColisId = createSelector(
  selectColisState,
  (state) => state.selectedColisId
);

export const selectSelectedColis = createSelector(
  selectColisEntities,
  selectSelectedColisId,
  (entities, id) => (id ? entities[id] : null)
);

// Filtered Colis
export const selectFilteredColis = createSelector(
  selectAllColis,
  selectStatusFilter,
  (colis, statusFilter) => {
    if (!statusFilter) return colis;
    return colis.filter((c) => c.statut === statusFilter);
  }
);

// Statistics
export const selectColisStatistics = createSelector(selectAllColis, (colis) => ({
  total: colis.length,
  enAttente: colis.filter((c) => c.statut === 'CREE' || c.statut === 'COLLECTE')
    .length,
  enTransit: colis.filter(
    (c) => c.statut === 'EN_TRANSIT' || c.statut === 'EN_STOCK'
  ).length,
  livres: colis.filter((c) => c.statut === 'LIVRE').length,
  annules: colis.filter((c) => c.statut === 'ANNULE').length,
  retournes: colis.filter((c) => c.statut === 'RETOURNE').length
}));
