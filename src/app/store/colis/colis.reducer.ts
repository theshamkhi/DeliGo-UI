import { createReducer, on } from '@ngrx/store';
import { Colis, StatutColis } from '../../core/models/colis.model';
import { ColisActions } from './colis.actions';
import { EntityState, EntityAdapter, createEntityAdapter } from '@ngrx/entity';

export interface ColisState extends EntityState<Colis> {
  selectedColisId: string | null;
  loading: boolean;
  error: string | null;
  totalElements: number;
  totalPages: number;
  currentPage: number;
  pageSize: number;
  statusFilter: StatutColis | null;
  searchKeyword: string | null;
}

export const colisAdapter: EntityAdapter<Colis> = createEntityAdapter<Colis>({
  selectId: (colis: Colis) => colis.id!,
  sortComparer: false
});

export const initialState: ColisState = colisAdapter.getInitialState({
  selectedColisId: null,
  loading: false,
  error: null,
  totalElements: 0,
  totalPages: 0,
  currentPage: 0,
  pageSize: 20,
  statusFilter: null,
  searchKeyword: null
});

export const colisReducer = createReducer(
  initialState,

  // Load All
  on(ColisActions.loadColis, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  on(ColisActions.loadColisSuccess, (state, { response }) =>
    colisAdapter.setAll(response.content, {
      ...state,
      loading: false,
      totalElements: response.totalElements,
      totalPages: response.totalPages,
      currentPage: response.number
    })
  ),
  on(ColisActions.loadColisFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),

  // Load One
  on(ColisActions.loadColisByIdSuccess, (state, { colis }) =>
    colisAdapter.upsertOne(colis, state)
  ),

  // Search
  on(ColisActions.searchColis, (state, { keyword }) => ({
    ...state,
    loading: true,
    searchKeyword: keyword
  })),
  on(ColisActions.searchColisSuccess, (state, { response }) =>
    colisAdapter.setAll(response.content, {
      ...state,
      loading: false,
      totalElements: response.totalElements,
      totalPages: response.totalPages
    })
  ),

  // Create
  on(ColisActions.createColis, (state) => ({
    ...state,
    loading: true
  })),
  on(ColisActions.createColisSuccess, (state, { colis }) =>
    colisAdapter.addOne(colis, {
      ...state,
      loading: false
    })
  ),

  // Update Status (Optimistic)
  on(ColisActions.updateStatus, (state, { id, statut }) =>
    colisAdapter.updateOne(
      {
        id,
        changes: { statut }
      },
      state
    )
  ),
  on(ColisActions.updateStatusSuccess, (state, { colis }) =>
    colisAdapter.updateOne(
      {
        id: colis.id!,
        changes: colis
      },
      state
    )
  ),
  on(ColisActions.updateStatusFailure, (state, { originalColis }) =>
    colisAdapter.updateOne(
      {
        id: originalColis.id!,
        changes: originalColis
      },
      {
        ...state,
        error: 'Échec de la mise à jour du statut'
      }
    )
  ),

  // Delete
  on(ColisActions.deleteColisSuccess, (state, { id }) =>
    colisAdapter.removeOne(id, state)
  ),

  // Filters
  on(ColisActions.setStatusFilter, (state, { status }) => ({
    ...state,
    statusFilter: status
  })),
  on(ColisActions.clearFilters, (state) => ({
    ...state,
    statusFilter: null,
    searchKeyword: null
  })),

  // Selection
  on(ColisActions.selectColis, (state, { id }) => ({
    ...state,
    selectedColisId: id
  })),
  on(ColisActions.clearSelection, (state) => ({
    ...state,
    selectedColisId: null
  }))
);
