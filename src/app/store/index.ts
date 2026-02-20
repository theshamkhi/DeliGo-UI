import { ActionReducerMap, MetaReducer } from '@ngrx/store';
import { environment } from '../../environments/environment';
import * as fromAuth from './auth/auth.reducer';
import * as fromColis from './colis/colis.reducer';
import * as fromUI from './ui/ui.reducer';

/**
 * Root application state interface
 */
export interface AppState {
  auth: fromAuth.AuthState;
  colis: fromColis.ColisState;
  ui: fromUI.UIState;
}

/**
 * Root reducers mapping
 */
export const reducers: ActionReducerMap<AppState> = {
  auth: fromAuth.authReducer,
  colis: fromColis.colisReducer,
  ui: fromUI.uiReducer
};

/**
 * Meta-reducers for debugging and logging
 */
export const metaReducers: MetaReducer<AppState>[] = !environment.production
  ? []
  : [];
