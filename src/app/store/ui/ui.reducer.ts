import { createReducer, on } from '@ngrx/store';
import { UIActions } from './ui.actions';

export interface UIState {
  loading: boolean;
  loadingMessage: string | null;
  error: string | null;
  successMessage: string | null;
}

export const initialState: UIState = {
  loading: false,
  loadingMessage: null,
  error: null,
  successMessage: null
};

export const uiReducer = createReducer(
  initialState,
  on(UIActions.showLoading, (state, { message }) => ({
    ...state,
    loading: true,
    loadingMessage: message || null
  })),
  on(UIActions.hideLoading, (state) => ({
    ...state,
    loading: false,
    loadingMessage: null
  })),
  on(UIActions.showError, (state, { message }) => ({
    ...state,
    error: message
  })),
  on(UIActions.clearError, (state) => ({
    ...state,
    error: null
  })),
  on(UIActions.showSuccess, (state, { message }) => ({
    ...state,
    successMessage: message
  })),
  on(UIActions.clearSuccess, (state) => ({
    ...state,
    successMessage: null
  }))
);
