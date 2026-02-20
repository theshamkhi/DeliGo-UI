import { createFeatureSelector, createSelector } from '@ngrx/store';
import { UIState } from './ui.reducer';

export const selectUIState = createFeatureSelector<UIState>('ui');

export const selectUILoading = createSelector(
  selectUIState,
  (state) => state.loading
);

export const selectUIError = createSelector(selectUIState, (state) => state.error);

export const selectUISuccess = createSelector(
  selectUIState,
  (state) => state.successMessage
);
